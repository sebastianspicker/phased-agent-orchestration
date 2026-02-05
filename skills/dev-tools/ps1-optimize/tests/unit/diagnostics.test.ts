import { describe, it, expect } from "vitest";
import { buildPssaScript } from "../../src/node/lib/diagnostics.js";

describe("diagnostics script", () => {
  it("escapes module paths for PowerShell single-quoted strings", () => {
    const script = buildPssaScript(["/workspace/a.ps1"], ["C:/O'Reilly/Mod"], "quick");
    expect(script).toContain("$env:PSModulePath='C:/O''Reilly/Mod;' + $env:PSModulePath");
    expect(script).not.toContain("C:/O'Reilly/Mod");
  });

  it("strips newline characters from module paths", () => {
    const script = buildPssaScript(["/workspace/a.ps1"], ["C:/Bad\nPath"], "quick");
    expect(script).toContain("$env:PSModulePath='C:/BadPath;' + $env:PSModulePath");
  });
});
