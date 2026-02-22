import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function badInput(message) {
  const err = new Error(message);
  err.code = "E_BAD_INPUT";
  return err;
}

export function getRepoRoot() {
  return repoRoot;
}

export function getPipelineDir(root = repoRoot) {
  return resolve(root, ".pipeline");
}

export function getPipelineStatePath(root = repoRoot) {
  return resolve(getPipelineDir(root), "pipeline-state.json");
}

export function getRunDir(runId, root = repoRoot) {
  if (!runId || typeof runId !== "string") {
    throw badInput("run_id is required");
  }
  return resolve(getPipelineDir(root), "runs", runId);
}

export function ensureRunDirs(runId, root = repoRoot) {
  const runDir = getRunDir(runId, root);
  mkdirSync(resolve(runDir, "gates"), { recursive: true });
  mkdirSync(resolve(runDir, "drift-reports"), { recursive: true });
  mkdirSync(resolve(runDir, "quality-reports"), { recursive: true });
  return runDir;
}

export function readJson(path, fallback = null) {
  if (!existsSync(path)) {
    return fallback;
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function loadPipelineState(root = repoRoot) {
  const path = getPipelineStatePath(root);
  const state = readJson(path, null);
  if (!state) {
    throw badInput(`pipeline state not found: ${path}`);
  }
  return state;
}

export function savePipelineState(state, root = repoRoot) {
  writeJson(getPipelineStatePath(root), state);
}

export function resolveWithinRepo(pathRef, root = repoRoot) {
  if (!pathRef || typeof pathRef !== "string") {
    throw badInput("path reference must be a non-empty string");
  }

  const rootReal = realpathSync(root);
  const resolved = isAbsolute(pathRef) ? resolve(pathRef) : resolve(rootReal, pathRef);
  const rel = relative(rootReal, resolved);
  if (rel.startsWith("..") || rel === "") {
    if (rel === "") {
      throw badInput("path reference must not point to repository root");
    }
    throw badInput(`path escapes repository root: ${pathRef}`);
  }
  return resolved;
}

export function toWorkspaceRelative(absPath, root = repoRoot) {
  const rootReal = realpathSync(root);
  const resolved = resolve(absPath);
  const rel = relative(rootReal, resolved);
  if (rel.startsWith("..") || rel.length === 0) {
    throw badInput(`path is outside repository root: ${absPath}`);
  }
  return rel;
}

export function gateFileNameForPhase(phase) {
  if (phase === "post-build") {
    return "postbuild-gate.json";
  }
  return `${phase}-gate.json`;
}

export function phaseToArtifactKey(phase) {
  if (phase === "arm") return "brief";
  if (phase === "design") return "design";
  if (phase === "adversarial-review") return "review";
  if (phase === "plan") return "plan";
  if (phase === "pmatch") return "drift_reports";
  if (phase.startsWith("quality") || phase === "security-review" || phase === "denoise") {
    return "quality_reports";
  }
  return null;
}

export function parseBooleanFlag(value) {
  if (value === true || value === false) return value;
  if (typeof value === "string") {
    if (["1", "true", "yes", "on"].includes(value.toLowerCase())) return true;
    if (["0", "false", "no", "off"].includes(value.toLowerCase())) return false;
  }
  return false;
}
