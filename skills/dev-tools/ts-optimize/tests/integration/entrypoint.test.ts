import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadProject } from "../../src/node/lib/loadProject.js";
import { runLint } from "../../src/node/lib/lint.js";
import type { Input } from "../../src/node/types.js";

describe("integration: lint pipeline", () => {
  it("analyzes a temp project and emits findings + patches", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ts-optimize-"));
    try {
      const filePath = path.join(root, "sample.ts");
      fs.writeFileSync(filePath, "let x = 1; console.log(x);\nvar y = 1;\n", "utf8");

      const input: Input = { project: { root }, actions: [] };
      const logs: string[] = [];
      const ctx = await loadProject(input, logs);
      const result = await runLint(ctx, undefined, false, logs);

      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.patches.length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
