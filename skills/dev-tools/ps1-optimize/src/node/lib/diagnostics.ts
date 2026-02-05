import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { Finding, ProjectContext, DebugLevel } from "../types.js";
import { rangeFromIndex } from "./range.js";

type PssaFinding = {
  RuleName?: string;
  Severity?: string;
  Message?: string;
  ScriptPath?: string;
  Line?: number;
  Column?: number;
  Extent?: { StartOffset?: number; EndOffset?: number };
};

function severityToLevel(sev?: string): "info" | "warn" | "error" {
  if (sev?.toLowerCase() === "error") return "error";
  if (sev?.toLowerCase() === "warning") return "warn";
  return "info";
}

function levelToSeverityList(level: DebugLevel): string[] {
  if (level === "quick") return ["Error"];
  if (level === "medium") return ["Error", "Warning"];
  return ["Error", "Warning", "Information"];
}

function escapePSSingleQuoted(value: string): string {
  return value.replace(/'/g, "''").replace(/[\r\n]/g, "");
}

export function buildPssaScript(paths: string[], modulePaths: string[], level: DebugLevel): string {
  const pathsJson = JSON.stringify(paths);
  const severityList = levelToSeverityList(level).map((s) => `'${s}'`).join(", ");
  const modulePathPrefix = modulePaths.length
    ? modulePaths.map((p) => escapePSSingleQuoted(p)).join(";") + ";"
    : "";

  return [
    "$ErrorActionPreference='Stop'",
    modulePathPrefix ? `$env:PSModulePath='${modulePathPrefix}' + $env:PSModulePath` : "",
    "$paths = ConvertFrom-Json '" + pathsJson.replace(/'/g, "''") + "'",
    "if (-not (Get-Module -ListAvailable -Name PSScriptAnalyzer)) { '' ; exit 0 }",
    `$res = Invoke-ScriptAnalyzer -Path $paths -Severity @(${severityList}) -Recurse:$false`,
    "$res | Select-Object RuleName, Severity, Message, ScriptPath, Line, Column, Extent | ConvertTo-Json -Depth 5"
  ]
    .filter(Boolean)
    .join("; ");
}

export async function runDiagnostics(
  ctx: ProjectContext,
  level: DebugLevel,
  logs: string[]
): Promise<{ findings: Finding[]; metrics: { diagnostics: number } }> {
  const findings: Finding[] = [];
  if (!ctx.sourceFilePaths.length) return { findings, metrics: { diagnostics: 0 } };

  const script = buildPssaScript(ctx.sourceFilePaths, ctx.modulePaths, level);

  let stdout = "";
  try {
    const result = spawnSync("pwsh", ["-NoProfile", "-Command", script], { encoding: "utf8" });
    if (result.error) {
      logs.push(`Diagnostics: pwsh not available (${String(result.error.message)}).`);
      return { findings, metrics: { diagnostics: 0 } };
    }
    if (result.status !== 0 && result.stderr) {
      logs.push(`Diagnostics: pwsh error: ${result.stderr.trim()}`);
    }
    stdout = (result.stdout ?? "").trim();
  } catch (err: any) {
    logs.push(`Diagnostics: failed to run pwsh (${err?.message ?? "unknown error"}).`);
    return { findings, metrics: { diagnostics: 0 } };
  }

  if (!stdout) {
    logs.push("Diagnostics: PSScriptAnalyzer not available or no findings.");
    return { findings, metrics: { diagnostics: 0 } };
  }

  let parsed: PssaFinding[] = [];
  try {
    const data = JSON.parse(stdout);
    parsed = Array.isArray(data) ? data : [data];
  } catch {
    logs.push("Diagnostics: failed to parse PSScriptAnalyzer output.");
    return { findings, metrics: { diagnostics: 0 } };
  }

  let diagCount = 0;
  for (const f of parsed) {
    diagCount += 1;
    const severity = severityToLevel(f.Severity);
    const finding: Finding = {
      kind: "diagnostic",
      severity,
      message: f.Message ?? "PSScriptAnalyzer finding",
      file: f.ScriptPath,
      ruleId: f.RuleName ?? "pssa",
      confidence: 0.8
    };

    if (f.Extent?.StartOffset != null && f.Extent?.EndOffset != null && f.ScriptPath) {
      try {
        const text = fs.readFileSync(f.ScriptPath!, "utf8");
        finding.range = rangeFromIndex(text, f.Extent.StartOffset, Math.max(1, f.Extent.EndOffset - f.Extent.StartOffset));
      } catch {
        if (f.Line && f.Column) {
          finding.range = { startLine: f.Line, startCol: f.Column, endLine: f.Line, endCol: f.Column };
        }
      }
    } else if (f.Line && f.Column) {
      finding.range = { startLine: f.Line, startCol: f.Column, endLine: f.Line, endCol: f.Column };
    }

    findings.push(finding);
  }

  return { findings, metrics: { diagnostics: diagCount } };
}
