import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const RUN_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

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
  if (!RUN_ID_PATTERN.test(runId)) {
    throw badInput(
      "run_id must match ^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$ and must not contain path separators",
    );
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

function assertPathWithinBase(resolvedPath, baseReal, pathRef, allowBase = false, baseLabel = "base directory") {
  const rel = relative(baseReal, resolvedPath);
  if (rel.startsWith("..") || isAbsolute(rel) || (!allowBase && rel.length === 0)) {
    if (!allowBase && rel.length === 0) {
      throw badInput(`path reference must not point to ${baseLabel}`);
    }
    throw badInput(`path escapes ${baseLabel}: ${pathRef}`);
  }
}

function findNearestExistingAncestor(pathValue) {
  let current = resolve(pathValue);
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return current;
}

function resolveWithinBase(pathRef, baseDir, options = {}) {
  if (!pathRef || typeof pathRef !== "string") {
    throw badInput("path reference must be a non-empty string");
  }

  const allowAbsolute = options.allowAbsolute === true;
  const allowBase = options.allowBase === true;
  const baseLabel = options.baseLabel || "base directory";
  if (isAbsolute(pathRef) && !allowAbsolute) {
    throw badInput("path reference must be relative");
  }

  const baseReal = realpathSync(baseDir);
  const resolved = isAbsolute(pathRef) ? resolve(pathRef) : resolve(baseReal, pathRef);
  assertPathWithinBase(resolved, baseReal, pathRef, allowBase, baseLabel);

  const nearestExisting = findNearestExistingAncestor(resolved);
  const nearestReal = realpathSync(nearestExisting);
  // The nearest existing ancestor can legitimately be the base directory itself
  // when resolving a new file path under baseDir.
  assertPathWithinBase(nearestReal, baseReal, pathRef, true, baseLabel);

  if (existsSync(resolved)) {
    const resolvedReal = realpathSync(resolved);
    assertPathWithinBase(resolvedReal, baseReal, pathRef, allowBase, baseLabel);
    return resolvedReal;
  }

  return resolved;
}

export function resolveWithinRepo(pathRef, root = repoRoot) {
  return resolveWithinBase(pathRef, root, {
    allowAbsolute: true,
    allowBase: false,
    baseLabel: "repository root",
  });
}

export function resolveWithinDirectory(baseDir, pathRef, options = {}) {
  return resolveWithinBase(pathRef, baseDir, {
    allowAbsolute: options.allowAbsolute === true,
    allowBase: options.allowBase === true,
    baseLabel: options.baseLabel || "base directory",
  });
}

export function toWorkspaceRelative(absPath, root = repoRoot) {
  const rootReal = realpathSync(root);
  const resolved = existsSync(absPath) ? realpathSync(absPath) : resolve(absPath);
  const rel = relative(rootReal, resolved);
  if (rel.startsWith("..") || isAbsolute(rel) || rel.length === 0) {
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
