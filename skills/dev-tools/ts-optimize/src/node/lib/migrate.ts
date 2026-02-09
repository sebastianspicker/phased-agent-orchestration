import fs from "node:fs";
import { ImportSpecifier } from "ts-morph";
import { Finding, MigrateOptions, Patch, ProjectContext, Targets } from "../types.js";
import { applyEdits, findEditConflicts, TextEdit } from "./edits.js";
import { unifiedDiff } from "./diff.js";
import { LIMITS } from "./limits.js";
import { shouldAnalyzeFile } from "./targets.js";

function buildImportReplacement(spec: ImportSpecifier, toName: string): TextEdit | undefined {
  const alias = spec.getAliasNode()?.getText();
  const importedName = spec.getName();
  if (importedName === toName) return;

  const replacement = alias ? `${toName} as ${alias}` : `${toName} as ${importedName}`;
  return { start: spec.getStart(), end: spec.getEnd(), newText: replacement };
}

function buildModuleReplacement(moduleNodeText: string, toModule: string): string {
  const quote = moduleNodeText.startsWith("'") ? "'" : "\"";
  return `${quote}${toModule}${quote}`;
}

export async function runMigrate(
  ctx: ProjectContext,
  options: MigrateOptions | undefined,
  applyFixes: boolean,
  logs: string[],
  targets?: Targets
): Promise<{ findings: Finding[]; patches: Patch[]; filesModified: number }> {
  const findings: Finding[] = [];
  const patches: Patch[] = [];
  let filesModified = 0;

  const renameImports = options?.renameImports ?? [];
  if (!renameImports.length) {
    findings.push({
      kind: "migration",
      severity: "info",
      message: "Migration: no renameImports rules provided; nothing to migrate.",
      ruleId: "migrate-no-rules",
      confidence: 1.0
    });
    return { findings, patches, filesModified };
  }

  const files = ctx.project.getSourceFiles().filter((sf) => shouldAnalyzeFile(sf.getFilePath(), ctx.rootAbs, targets));
  const sliced = files.slice(0, LIMITS.MAX_FILES_HEURISTICS);

  logs.push(`Migrate: applying ${renameImports.length} renameImport rule(s) on ${sliced.length} files.`);

  for (const sf of sliced) {
    const p = sf.getFilePath();
    let oldText: string;
    try {
      oldText = fs.readFileSync(p, "utf8");
    } catch {
      continue;
    }
    // Sync in-memory AST with disk so getStart()/getEnd() match current content
    // (e.g. after a prior action in this run wrote the file).
    sf.replaceWithText(oldText);

    const edits: TextEdit[] = [];
    const moduleEditKeys = new Set<string>();
    for (const rule of renameImports) {
      for (const decl of sf.getImportDeclarations()) {
        const moduleValue = decl.getModuleSpecifierValue();
        if (moduleValue !== rule.from.module) continue;

        if (rule.from.module !== rule.to.module) {
          const moduleNode = decl.getModuleSpecifier();
          const key = `${moduleNode.getStart()}-${moduleNode.getEnd()}`;
          if (!moduleEditKeys.has(key)) {
            edits.push({
              start: moduleNode.getStart(),
              end: moduleNode.getEnd(),
              newText: buildModuleReplacement(moduleNode.getText(), rule.to.module)
            });
            moduleEditKeys.add(key);
          }
        }

        for (const spec of decl.getNamedImports()) {
          if (spec.getName() !== rule.from.name) continue;
          const repl = buildImportReplacement(spec, rule.to.name);
          if (repl) edits.push(repl);

          findings.push({
            kind: "migration",
            severity: "info",
            message: `Migration: rename import ${rule.from.name} -> ${rule.to.name} from ${rule.from.module}.`,
            file: p,
            ruleId: "migrate-rename-import",
            confidence: 0.7
          });
        }
      }
    }

    if (!edits.length) continue;

    const conflicts = findEditConflicts(edits);
    if (conflicts.length) {
      logs.push(`Migrate: conflicting edits in ${p}; skipping this file.`);
      continue;
    }

    const newText = applyEdits(oldText, edits);
    if (newText === oldText) continue;

    const patch = unifiedDiff(p, oldText, newText);
    patches.push({ path: p, patch });

    if (applyFixes) {
      try {
        fs.writeFileSync(p, newText, "utf8");
        filesModified += 1;
      } catch {
        logs.push(`Migrate: failed to write ${p}`);
      }
    }
  }

  return { findings, patches, filesModified };
}
