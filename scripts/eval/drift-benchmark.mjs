#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const TAXONOMY = ["interface", "invariant", "security", "performance", "docs"];
const MODES = ["heuristic", "dual-extractor"];

function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    output: ".pipeline/evaluations/drift-quality-report.json",
    precisionMin: 0.75,
    recallMin: 0.65,
    f1Min: 0.7,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--root") args.root = argv[++i] ?? args.root;
    else if (arg === "--output") args.output = argv[++i] ?? args.output;
    else if (arg === "--precision-min") args.precisionMin = Number(argv[++i] ?? args.precisionMin);
    else if (arg === "--recall-min") args.recallMin = Number(argv[++i] ?? args.recallMin);
    else if (arg === "--f1-min") args.f1Min = Number(argv[++i] ?? args.f1Min);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function toMetrics(tp, fp, fn) {
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1 };
}

function evaluateByClass(expected, predicted) {
  const byClass = {};
  let totalTp = 0;
  let totalFp = 0;
  let totalFn = 0;

  for (const cls of TAXONOMY) {
    const expectedCount = expected.filter((item) => item === cls).length;
    const predictedCount = predicted.filter((item) => item === cls).length;
    const tp = Math.min(expectedCount, predictedCount);
    const fp = Math.max(0, predictedCount - expectedCount);
    const fn = Math.max(0, expectedCount - predictedCount);

    byClass[cls] = toMetrics(tp, fp, fn);
    totalTp += tp;
    totalFp += fp;
    totalFn += fn;
  }

  return {
    overall: toMetrics(totalTp, totalFp, totalFn),
    by_class: byClass,
  };
}

function runSkill(repoRoot, fixture, targetRef, mode) {
  const skillEntrypoint = resolve(repoRoot, "skills/dev-tools/multi-model-review/dist/index.js");
  if (!existsSync(skillEntrypoint)) {
    throw new Error(
      "multi-model-review dist/index.js not found. Run npm run build in skills/dev-tools/multi-model-review first.",
    );
  }

  const driftConfig = {
    target_ref: targetRef,
    mode,
  };

  if (mode === "dual-extractor") {
    if (!Array.isArray(fixture.extractor_claim_sets) || fixture.extractor_claim_sets.length !== 2) {
      throw new Error(`fixture ${fixture.id} missing extractor_claim_sets for dual-extractor mode`);
    }
    driftConfig.extractor_claim_sets = fixture.extractor_claim_sets;
  }

  const input = {
    action: { type: "drift-detect" },
    document: { content: fixture.source, type: "plan" },
    drift_config: driftConfig,
  };

  const result = spawnSync("node", [skillEntrypoint], {
    cwd: repoRoot,
    input: JSON.stringify(input),
    encoding: "utf8",
    env: {
      ...process.env,
      WORKSPACE_ROOT: repoRoot,
    },
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "drift-detect failed");
  }

  const parsed = JSON.parse(result.stdout);
  if (!parsed.success) {
    throw new Error(parsed.error?.message || "drift-detect failed");
  }

  return parsed.data;
}

function normalizeExpected(fixture) {
  if (!Array.isArray(fixture.expected)) return [];
  return fixture.expected
    .filter((entry) => entry?.verification_status !== "verified")
    .map((entry) => entry.claim_type)
    .filter((entry) => TAXONOMY.includes(entry));
}

function normalizePredicted(driftResult) {
  if (!Array.isArray(driftResult?.claims)) return [];
  return driftResult.claims
    .filter((claim) => claim?.verification_status !== "verified")
    .map((claim) => claim.claim_type)
    .filter((entry) => TAXONOMY.includes(entry));
}

function thresholdFailed(metric, thresholds) {
  return (
    metric.precision < thresholds.precision ||
    metric.recall < thresholds.recall ||
    metric.f1 < thresholds.f1
  );
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = resolve(args.root);
  const casesDir = resolve(repoRoot, "docs/eval/drift_goldset/cases");
  const outPath = resolve(repoRoot, args.output);
  const workspaceTmpRoot = resolve(repoRoot, ".pipeline", "tmp");

  const thresholds = {
    precision: args.precisionMin,
    recall: args.recallMin,
    f1: args.f1Min,
  };

  mkdirSync(workspaceTmpRoot, { recursive: true });
  mkdirSync(dirname(outPath), { recursive: true });
  const tmpDir = mkdtempSync(join(workspaceTmpRoot, "drift-benchmark-"));

  const files = readdirSync(casesDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  const modeResults = {};
  for (const mode of MODES) {
    modeResults[mode] = {
      expected: [],
      predicted: [],
      cases: [],
    };
  }

  try {
    for (const file of files) {
      const fixturePath = resolve(casesDir, file);
      const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
      const targetPath = join(tmpDir, `${fixture.id}.target.md`);
      writeFileSync(targetPath, fixture.target, "utf8");
      const targetRef = relative(repoRoot, targetPath);
      const expected = normalizeExpected(fixture);

      for (const mode of MODES) {
        const drift = runSkill(repoRoot, fixture, targetRef, mode);
        const predicted = normalizePredicted(drift);
        const metrics = evaluateByClass(expected, predicted);

        modeResults[mode].expected.push(...expected);
        modeResults[mode].predicted.push(...predicted);
        modeResults[mode].cases.push({
          case_id: fixture.id,
          metrics,
          expected,
          predicted,
        });
      }
    }

    const metricsByMode = {};
    const metricsByClass = {};

    for (const cls of TAXONOMY) {
      metricsByClass[cls] = {};
    }

    for (const mode of MODES) {
      const aggregate = evaluateByClass(modeResults[mode].expected, modeResults[mode].predicted);
      metricsByMode[mode] = aggregate.overall;
      for (const cls of TAXONOMY) {
        metricsByClass[cls][mode] = aggregate.by_class[cls];
      }
      modeResults[mode].aggregate = aggregate;
    }

    const overall = {
      precision:
        MODES.reduce((acc, mode) => acc + metricsByMode[mode].precision, 0) / MODES.length,
      recall: MODES.reduce((acc, mode) => acc + metricsByMode[mode].recall, 0) / MODES.length,
      f1: MODES.reduce((acc, mode) => acc + metricsByMode[mode].f1, 0) / MODES.length,
    };

    const failedModes = MODES.filter((mode) => thresholdFailed(metricsByMode[mode], thresholds));

    const report = {
      generated_at: new Date().toISOString(),
      case_count: files.length,
      thresholds,
      metrics_by_mode: metricsByMode,
      metrics_by_class: metricsByClass,
      overall,
      modes: Object.fromEntries(
        MODES.map((mode) => [
          mode,
          {
            overall: modeResults[mode].aggregate.overall,
            by_class: modeResults[mode].aggregate.by_class,
            cases: modeResults[mode].cases,
          },
        ]),
      ),
      status: failedModes.length === 0 ? "pass" : "fail",
      failed_modes: failedModes,
    };

    writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`${outPath}\n`);

    if (failedModes.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
