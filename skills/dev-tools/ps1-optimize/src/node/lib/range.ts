import { Range } from "../types.js";

export function rangeFromIndex(text: string, start: number, length: number): Range {
  const len = text.length;
  start = Math.max(0, Math.min(start, len));
  length = Math.max(0, Math.min(length, len - start));

  const before = text.slice(0, start);
  const startLine = before.split("\n").length;
  const startCol = start === 0 ? 1 : before.length - before.lastIndexOf("\n");

  const segment = text.slice(start, start + length);
  const segmentLines = segment.split("\n");
  const endLine = segmentLines.length === 0 ? startLine : startLine + segmentLines.length - 1;
  const endCol =
    segmentLines.length <= 1
      ? startCol + segment.length
      : (segmentLines[segmentLines.length - 1] ?? "").length + 1;

  return { startLine, startCol, endLine, endCol };
}
