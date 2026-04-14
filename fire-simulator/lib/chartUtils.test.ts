import { describe, it, expect } from "vitest";
import { yAxisFormatter } from "./chartUtils";

describe("yAxisFormatter", () => {
  it("formats millions", () => {
    expect(yAxisFormatter(1_500_000)).toBe("1.5M");
    expect(yAxisFormatter(2_000_000)).toBe("2.0M");
  });

  it("formats thousands", () => {
    expect(yAxisFormatter(50_000)).toBe("50k");
    expect(yAxisFormatter(1_000)).toBe("1k");
  });

  it("formats small values as-is", () => {
    expect(yAxisFormatter(500)).toBe("500");
    expect(yAxisFormatter(0)).toBe("0");
  });

  it("handles negative values", () => {
    expect(yAxisFormatter(-500)).toBe("-500");
  });
});
