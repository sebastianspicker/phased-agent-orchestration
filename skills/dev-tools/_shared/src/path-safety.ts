import { realpathSync } from "node:fs";
import path from "node:path";

function badInput(message: string): Error {
  return Object.assign(new Error(message), { code: "E_BAD_INPUT" });
}

export function assertRepoRelativePath(ref: string, label: string): void {
  if (!ref || typeof ref !== "string") {
    throw badInput(`${label} must be a non-empty string`);
  }
  if (path.isAbsolute(ref)) {
    throw badInput(`${label} must be repository-relative`);
  }
  const normalized = path.normalize(ref);
  if (normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    throw badInput(`${label} must be repository-relative`);
  }
}

export function resolveWithinWorkspace(
  workspaceRoot: string,
  relativeRef: string,
  label: string,
  opts: { rootLabel?: string } = {},
): string {
  const rootLabel = opts.rootLabel ?? "workspaceRoot";
  const outOfRootMessage = `${label} must resolve within ${rootLabel}`;

  if (path.isAbsolute(relativeRef)) {
    throw badInput(outOfRootMessage);
  }

  const root = realpathSync(path.resolve(workspaceRoot));
  const resolved = path.resolve(root, relativeRef);
  const relative = path.relative(root, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw badInput(outOfRootMessage);
  }

  try {
    const resolvedReal = realpathSync(resolved);
    const resolvedRel = path.relative(root, resolvedReal);
    if (resolvedRel.startsWith("..") || path.isAbsolute(resolvedRel)) {
      throw badInput(outOfRootMessage);
    }
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code !== "ENOENT") {
      throw err;
    }
  }

  return resolved;
}
