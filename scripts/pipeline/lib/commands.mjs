/**
 * CLI command implementations for the pipeline runner.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { PHASE_ORDER } from "../../lib/constants.mjs";
import { badInput } from "./errors.mjs";
import {
  getRepoRoot,
  loadPipelineState,
  resolveWithinRepo,
  savePipelineState,
  toWorkspaceRelative,
} from "./state.mjs";
import {
  appendTraceEvent,
  summarizeRun,
} from "./trace.mjs";
import {
  assertGateStatus,
  emitGate,
  emitRetryEventIfNeeded,
} from "./gates.mjs";

const PHASES = PHASE_ORDER;
const PHASE_END_STATUS_SET = new Set(["ok", "error"]);
const ARTIFACT_ACTION_SET = new Set(["read", "write"]);
const SUMMARY_FORMATS = new Set(["json", "text", "markdown"]);

export function runStartPhase(options, { requireOption, assertKnownPhase, ensureStateForRun, appendRunStartIfMissing }) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  assertKnownPhase(phase, "--phase");

  const state = loadPipelineState();
  ensureStateForRun(state, runId);
  appendRunStartIfMissing(runId, state);
  emitRetryEventIfNeeded(runId, phase);

  appendTraceEvent(runId, {
    event: "phase_start",
    phase,
    status: "ok",
  });

  state.current_phase = phase;
  savePipelineState(state);

  process.stdout.write(`${JSON.stringify({ success: true, run_id: runId, phase, event: "phase_start" }, null, 2)}\n`);
}

export function runEndPhase(options, { requireOption, assertKnownPhase }) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  assertKnownPhase(phase, "--phase");
  const status = options.status || "ok";
  if (!PHASE_END_STATUS_SET.has(status)) {
    throw badInput("--status must be one of: ok, error");
  }

  appendTraceEvent(runId, {
    event: "phase_end",
    phase,
    status,
  });

  // Note: endPhase intentionally does NOT save pipeline state.
  // Unlike startPhase (which sets current_phase), endPhase has no state
  // to update — the trace event is the authoritative record of phase
  // completion. The next startPhase call will advance current_phase.

  process.stdout.write(`${JSON.stringify({ success: true, run_id: runId, phase, event: "phase_end", status }, null, 2)}\n`);
}

export function runRecordArtifact(options, { requireOption, assertKnownPhase }) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  assertKnownPhase(phase, "--phase");
  const artifactRef = requireOption(options, "artifact-ref");
  resolveWithinRepo(artifactRef);
  const requestedAction = options.action || "write";
  if (!ARTIFACT_ACTION_SET.has(requestedAction)) {
    throw badInput("--action must be one of: read, write");
  }
  const action = requestedAction === "read" ? "artifact_read" : "artifact_write";

  appendTraceEvent(runId, {
    event: action,
    phase,
    artifact_ref: artifactRef,
    status: "ok",
  });

  process.stdout.write(`${JSON.stringify({ success: true, run_id: runId, phase, event: action, artifact_ref: artifactRef }, null, 2)}\n`);
}

export function runRecordGate(options, { requireOption, assertKnownPhase }) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  assertKnownPhase(phase, "--phase");
  const status = requireOption(options, "status");
  assertGateStatus(status, "--status");
  const gateId = options["gate-id"] || `${phase}-gate`;
  const artifactRef = options["artifact-ref"] || "n/a";

  const gate = emitGate({
    runId,
    phase,
    gateId,
    status,
    artifactRef,
    criteria: [],
    blockingFailures: status === "fail" ? [gateId] : [],
    metadata: {
      source: "record-gate",
    },
    gateFileOverride: options["gate-file"],
  });

  process.stdout.write(`${JSON.stringify({ success: true, run_id: runId, gate }, null, 2)}\n`);
}

export function runSummarizeRun(options, { requireOption, ensureStateForRun, appendRunStartIfMissing, appendRunEndIfMissing }) {
  const runId = requireOption(options, "run-id");
  const format = options.format || "json";
  if (!SUMMARY_FORMATS.has(format)) {
    throw badInput("--format must be one of: json, text, markdown");
  }
  const outputRef = options.output;
  const root = getRepoRoot();
  const state = loadPipelineState();
  ensureStateForRun(state, runId);
  appendRunStartIfMissing(runId, state);
  appendRunEndIfMissing(runId, state);
  const summary = summarizeRun(runId, root);
  savePipelineState(state);

  const jsonPayload = { success: true, run_id: runId, summary };

  const gatePass = summary.gate_results?.pass ?? 0;
  const gateFail = summary.gate_results?.fail ?? 0;
  const gateWarn = summary.gate_results?.warn ?? 0;
  const issues = Array.isArray(summary.issues) ? summary.issues : [];
  const phaseDurations = summary.phase_durations_ms ?? {};
  const activePhases = PHASES.filter((p) => phaseDurations[p] !== undefined);

  const renderText = () => {
    const phaseLines = activePhases.map((p) => `  - ${p}: ${phaseDurations[p]} ms`);

    return [
      `Run summary: ${runId}`,
      `valid: ${summary.valid ? "true" : "false"}`,
      `events: ${summary.total_events ?? 0}`,
      `gates: pass=${gatePass} warn=${gateWarn} fail=${gateFail}`,
      `duration_s: ${summary.total_duration_s ?? 0}`,
      `cost_usd: ${summary.total_cost_usd ?? 0}`,
      `tokens: in=${summary.total_tokens_in ?? 0} out=${summary.total_tokens_out ?? 0}`,
      issues.length > 0 ? `issues (${issues.length}):` : "issues: none",
      ...(issues.length > 0 ? issues.map((issue) => `  - ${issue}`) : []),
      phaseLines.length > 0 ? "phase_durations_ms:" : "phase_durations_ms: none",
      ...phaseLines,
      "",
    ].join("\n");
  };

  const renderMarkdown = () => {
    const phaseRows = activePhases.map((p) => `| ${p} | ${phaseDurations[p]} |`);

    return [
      `# Run Summary: ${runId}`,
      "",
      `- Valid: \`${summary.valid ? "true" : "false"}\``,
      `- Total events: \`${summary.total_events ?? 0}\``,
      `- Gates: pass=\`${gatePass}\`, warn=\`${gateWarn}\`, fail=\`${gateFail}\``,
      `- Duration (s): \`${summary.total_duration_s ?? 0}\``,
      `- Cost (USD): \`${summary.total_cost_usd ?? 0}\``,
      `- Tokens: in=\`${summary.total_tokens_in ?? 0}\`, out=\`${summary.total_tokens_out ?? 0}\``,
      "",
      "## Phase Durations",
      "",
      "| Phase | Duration (ms) |",
      "| --- | ---: |",
      ...(phaseRows.length > 0 ? phaseRows : ["| (none) | 0 |"]),
      "",
      "## Issues",
      "",
      ...(issues.length > 0 ? issues.map((issue) => `- ${issue}`) : ["- None"]),
      "",
    ].join("\n");
  };

  let rendered = "";
  if (format === "text") {
    rendered = renderText();
  } else if (format === "markdown") {
    rendered = renderMarkdown();
  }

  let outputPath;
  if (outputRef) {
    const outputAbs = resolveWithinRepo(outputRef, root);
    mkdirSync(dirname(outputAbs), { recursive: true });
    if (format === "json") {
      writeFileSync(outputAbs, `${JSON.stringify(jsonPayload, null, 2)}\n`, "utf8");
    } else {
      writeFileSync(outputAbs, rendered, "utf8");
    }
    outputPath = toWorkspaceRelative(outputAbs, root);
  }

  if (format === "json") {
    const payload = outputPath ? { ...jsonPayload, format, output_ref: outputPath } : jsonPayload;
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  if (outputPath) {
    process.stdout.write(
      `${JSON.stringify({ success: true, run_id: runId, format, output_ref: outputPath }, null, 2)}\n`,
    );
    return;
  }

  process.stdout.write(rendered);
}

export function printUsage() {
  process.stdout.write(`Usage: node scripts/pipeline/runner.mjs <command> [options]\n\n`);
  process.stdout.write(`Commands:\n`);
  process.stdout.write(`  start-phase   --run-id <id> --phase <phase>\n`);
  process.stdout.write(`  end-phase     --run-id <id> --phase <phase> [--status <ok|error>]\n`);
  process.stdout.write(`  record-artifact --run-id <id> --phase <phase> --artifact-ref <path> [--action <read|write>]\n`);
  process.stdout.write(`  record-gate   --run-id <id> --phase <phase> --status <pass|fail|warn> [--gate-id <id>]\n`);
  process.stdout.write(`  summarize-run --run-id <id> [--format <json|text|markdown>] [--output <path>]\n`);
  process.stdout.write(`  run-stage     --run-id <id> --phase <phase> [--taskset <path> --task-id <id> --config-id <id>]\n`);
}
