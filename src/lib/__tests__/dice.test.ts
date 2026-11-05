import { describe, it, expect } from "vitest";
import { stepDie, helpSteps, detectCritical } from "../dice";
describe("mecânica de dados", () => {
  it("passos d4–d12 com limites", () => { expect(stepDie(6, 1)).toBe(8); expect(stepDie(12, 1)).toBe(12); expect(stepDie(4, -1)).toBe(4); });
  it("ajuda", () => { expect(helpSteps(4)).toBe(0); expect(helpSteps(8)).toBe(1); expect(helpSteps(10)).toBe(2); });
  it("críticos", () => { expect(detectCritical([6, 6])).toBe("success"); expect(detectCritical([5, 5])).toBeUndefined(); expect(detectCritical([1, 1])).toBe("fumble"); });
});
