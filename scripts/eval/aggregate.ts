#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type ConfigurationId =
  | "baseline_single_agent"
  | "phased_default"
  | "phased_plus_reviewers"
  | "phased_with_context_budgets"
  | "phased_dual_extractor_drift";

interface MatrixConfig {
  id: ConfigurationId;
  run_ids: string[];
}

interface MatrixInput {
  evaluation_id: string;
  taskset_id: string;
  configurations: MatrixConfig[];
}

const CONFIG_IDS: ConfigurationId[] = [
  "baseline_single_agent",
  "phased_default",
  "phased_plus_reviewers",
  "phased_with_context_budgets",
  "phased_dual_extractor_drift",
];

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function p95(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[idx] ?? 0;
}

function driftScoreFromClaims(claims: Array<{ verification_status: string }>): number {
  if (!Array.isArray(claims) || claims.length === 0) return 0;
  const scoreByStatus: Record<string, number> = {
    verified: 0,
    partial: 0.5,
    violated: 1,
    unverifiable: 0.75,
  };
  return mean(claims.map((c) => scoreByStatus[c.verification_status] ?? 0.75));
}

function parseArgs(argv: string[]) {
  const args: { matrix: string | null; output: string | null; root: string } = {
    matrix: null,
    output: null,
    root: process.cwd(),
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--matrix") args.matrix = argv[++i] ?? null;
    else if (arg === "--output") args.output = argv[++i] ?? null;
    else if (arg === "--root") args.root = argv[++i] ?? process.cwd();
  }
  if (!args.matrix || !args.output) {
    throw new Error("Usage: aggregate.ts --matrix <matrix.json> --output <evaluation-report.json> [--root <repo>]");
  }
  return args;
}

function loadRunMetrics(root: string, runId: string) {
  const runDir = resolve(root, ".pipeline", "runs", runId);
  const traceSummary = readJson<Record<string, unknown>>(resolve(runDir, "trace.summary.json"), {});
  const drift = readJson<Record<string, unknown>>(resolve(runDir, "drift-reports", "pmatch.json"), {});
  const review = readJson<Record<string, unknown>>(resolve(runDir, "review.json"), {});
  const security = readJson<Record<string, unknown>>(resolve(runDir, "quality-reports", "security.json"), {});

  const gateFiles = [
    "arm-gate.json",
    "design-gate.json",
    "adversarial-review-gate.json",
    "plan-gate.json",
    "pmatch-gate.json",
    "build-gate.json",
    "quality-static-gate.json",
    "quality-tests-gate.json",
    "postbuild-gate.json",
    "release-readiness-gate.json",
  ];

  const gateResults = gateFiles
    .map((name) => readJson<Record<string, unknown> | null>(resolve(runDir, "gates", name), null))
    .filter(Boolean)
    .map((gate) => ({
      phase: String(gate?.phase ?? "unknown"),
      status: String(gate?.status ?? "fail"),
    }));

  const reviewers = Array.isArray(review.reviewers)
    ? (review.reviewers as Array<{ findings?: unknown[] }>)
    : [];
  const dedupFindings = Array.isArray(review.deduplicated_findings)
    ? review.deduplicated_findings.length
    : 0;

  const rawFindings = reviewers.reduce((acc, reviewer) => {
    const count = Array.isArray(reviewer.findings) ? reviewer.findings.length : 0;
    return acc + count;
  }, 0);

  const claims = Array.isArray(drift.claims)
    ? (drift.claims as Array<{ verification_status: string }>)
    : [];

  const securityAudit = security.security_audit as Record<string, unknown> | undefined;
  const fixLoop = securityAudit?.fix_loop as Record<string, unknown> | undefined;

  return {
    run_id: runId,
    success: gateResults.length > 0 && gateResults.every((gate) => gate.status === "pass"),
    cost_usd: Number(traceSummary.total_cost_usd ?? 0),
    latency_s: Number(traceSummary.total_duration_s ?? 0),
    drift_score: driftScoreFromClaims(claims),
    dedup_ratio: dedupFindings > 0 ? rawFindings / dedupFindings : 1,
    security_time_to_closure_s: Number(
      traceSummary.security_time_to_closure_s ?? fixLoop?.rounds ?? 0,
    ),
    gate_results: gateResults,
  };
}

function gatePassRate(gates: Array<{ phase: string; status: string }>): Record<string, number> {
  const stats: Record<string, { pass: number; total: number }> = {};
  for (const gate of gates) {
    if (!stats[gate.phase]) stats[gate.phase] = { pass: 0, total: 0 };
    stats[gate.phase]!.total += 1;
    if (gate.status === "pass") stats[gate.phase]!.pass += 1;
  }

  const result: Record<string, number> = {};
  for (const [phase, value] of Object.entries(stats)) {
    result[phase] = value.total === 0 ? 0 : value.pass / value.total;
  }
  return result;
}

function aggregate(configurations: Array<{ id: ConfigurationId; runs: ReturnType<typeof loadRunMetrics>[] }>) {
  const pipelineSuccessRate: Record<string, number> = {};
  const gatePassRateByPhase: Record<string, Record<string, number>> = {};
  const meanDriftScore: Record<string, number> = {};
  const driftP95: Record<string, number> = {};
  const meanCost: Record<string, number> = {};
  const meanLatency: Record<string, number> = {};
  const dedupRatio: Record<string, number> = {};
  const securityClosure: Record<string, { mean: number; p95: number }> = {};

  for (const config of configurations) {
    const runs = config.runs;
    pipelineSuccessRate[config.id] = mean(runs.map((run) => (run.success ? 1 : 0)));
    gatePassRateByPhase[config.id] = gatePassRate(runs.flatMap((run) => run.gate_results));
    meanDriftScore[config.id] = mean(runs.map((run) => run.drift_score));
    driftP95[config.id] = p95(runs.map((run) => run.drift_score));
    meanCost[config.id] = mean(runs.map((run) => run.cost_usd));
    meanLatency[config.id] = mean(runs.map((run) => run.latency_s));
    dedupRatio[config.id] = mean(runs.map((run) => run.dedup_ratio));
    securityClosure[config.id] = {
      mean: mean(runs.map((run) => run.security_time_to_closure_s)),
      p95: p95(runs.map((run) => run.security_time_to_closure_s)),
    };
  }

  return {
    pipeline_success_rate: pipelineSuccessRate,
    gate_pass_rate_by_phase: gatePassRateByPhase,
    mean_drift_score: meanDriftScore,
    drift_p95: driftP95,
    mean_cost_usd_per_run: meanCost,
    mean_latency_s_per_run: meanLatency,
    dedup_ratio: dedupRatio,
    security_time_to_closure: securityClosure,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const matrix = readJson<MatrixInput>(resolve(args.root, args.matrix!), {
    evaluation_id: "",
    taskset_id: "",
    configurations: [],
  });

  const configs = CONFIG_IDS.map((id) => {
    const configured = matrix.configurations.find((entry) => entry.id === id);
    const runIds = configured?.run_ids ?? [];
    const runs = runIds.map((runId) => loadRunMetrics(args.root, runId));
    return {
      id,
      run_count: runs.length,
      runs,
    };
  });

  const report = {
    evaluation_id: matrix.evaluation_id,
    created_at: new Date().toISOString(),
    taskset_id: matrix.taskset_id,
    configurations: configs,
    metrics: aggregate(configs),
  };

  const outputPath = resolve(args.root, args.output!);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${outputPath}\n`);
}

main();
