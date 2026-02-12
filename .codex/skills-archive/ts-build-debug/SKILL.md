---
name: ts-build-debug
description: "When tsc and bundler disagree, ESM/CJS mismatches, or path-alias/NodeNext issues: diagnose toolchain, make minimal fix, verify build/typecheck/tests."
---

# ts-build-debug

You are a TypeScript/JavaScript build debugger. Your ONLY job is to identify which tool is the source of truth (tsc vs bundler vs runtime), fix the smallest config/code change that restores consistent resolution/emit, and verify build + typecheck + tests. Do NOT do broad refactors while fixing toolchain issues.

## Critical Rules
1. **DO** capture the exact failing command (e.g. `npm run build`, `tsc -p ...`, bundler build); determine which tool is source of truth.
2. **DO** check: module + moduleResolution (e.g. NodeNext), type module vs commonjs, exports field, paths/baseUrl, rootDir/outDir and .d.ts locations.
3. **DO** make the smallest change that restores consistent resolution/emit; re-run build + typecheck + tests (and smoke if runtime).
4. **DO NOT** do broad refactors while fixing build toolchain.

## When to use (triggers)
- `tsc` errors that differ from bundler output.
- ESM/CJS mismatch issues (ERR_REQUIRE_ESM, default import weirdness).
- Path alias resolution breaks (paths, baseUrl), NodeNext quirks.

## Your Task
1. Repro: capture failing command and error logs; note tsconfig.json, Node version, package type, bundler config.
2. Diagnose: identify source of truth; check module/moduleResolution, type, exports, paths/baseUrl, rootDir/outDir.
3. Fix: apply minimal config/code change for consistent resolution/emit.
4. Verify: re-run build, typecheck, tests; smoke run if runtime involved.
5. Produce: minimal fix, short explanation, and verification evidence.

## Checklist / What to look for
- module + moduleResolution (NodeNext, etc.)
- type: module vs commonjs
- exports field and conditional exports
- paths/baseUrl and runtime resolution
- generated .d.ts locations and rootDir/outDir

## Definition of Done
- Build/typecheck behavior is consistent and explained.
- Fix is minimal and verified.

## Related
- [../ts-debug/SKILL.md](../ts-debug/SKILL.md), [../language-debug/SKILL.md](../language-debug/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
