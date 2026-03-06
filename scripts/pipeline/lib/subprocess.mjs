/**
 * Shared subprocess spawner for pipeline skill tools.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { getRepoRoot } from "./state.mjs";

/**
 * Spawn a skill tool as a subprocess and parse its JSON output.
 *
 * @param {object} opts
 * @param {string} opts.entrypoint  Repo-relative path to the dist/index.js
 * @param {object} opts.input       JSON payload piped to stdin
 * @param {string} [opts.root]      Workspace root (defaults to repo root)
 * @param {string} opts.toolName    Human-readable tool name for error messages
 * @param {number} [opts.timeoutMs] Subprocess timeout in ms (default 30000)
 * @returns {object} Parsed `data` from the tool's JSON envelope
 */
export function spawnSkillTool({
  entrypoint,
  input,
  root = getRepoRoot(),
  toolName,
  timeoutMs = 30_000,
}) {
  const resolvedEntry = resolve(root, entrypoint);
  if (!existsSync(resolvedEntry)) {
    const err = new Error(
      `${toolName} dist entrypoint missing. Run npm run build in ${entrypoint.replace("/dist/index.js", "")}.`,
    );
    err.code = `E_${toolName.toUpperCase().replace(/-/g, "_")}_MISSING`;
    throw err;
  }

  const proc = spawnSync("node", [resolvedEntry], {
    cwd: root,
    input: JSON.stringify(input),
    encoding: "utf8",
    timeout: timeoutMs,
    env: {
      ...process.env,
      WORKSPACE_ROOT: root,
    },
  });

  const toolKey = toolName.toUpperCase().replace(/-/g, "_");

  const rawOut = proc.stdout || proc.stderr;
  if (!rawOut) {
    const err = new Error(`${toolName} returned empty output`);
    err.code = `E_${toolKey}_EMPTY`;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawOut);
  } catch (error) {
    const err = new Error(`${toolName} returned invalid JSON: ${String(error)}`);
    err.code = `E_${toolKey}_PARSE`;
    throw err;
  }

  if (proc.status !== 0 || !parsed.success) {
    const msg = parsed?.error?.message || rawOut;
    const err = new Error(`${toolName} failed: ${msg}`);
    err.code = parsed?.error?.code || `E_${toolKey}_FAILED`;
    throw err;
  }

  return parsed.data;
}
