import { describe, expect, it } from "vitest";
import { RequirementAnalysisSchema } from "@src/contracts/RequirementAnalysisSchema.js";

describe("RequirementAnalysisSchema Contract Unit Tests", () => {
  it("accepts a valid output conforming to the contract", () => {
    const output = {
      actor: "Customer",
      feature: "Cancel order",
      preconditions: ["An order has been placed."],
      positiveScenarios: ["Customer cancels the order within one day."],
      negativeScenarios: ["Customer attempts cancellation after one day."],
      ambiguities: []
    };

    const result = RequirementAnalysisSchema.safeParse(output);
    expect(result.success).toBe(true);
  });

  it("rejects a missing field", () => {
    const output = {
      actor: "Customer",
      feature: "Cancel order",
      preconditions: [],
      positiveScenarios: [],
      negativeScenarios: []
      // ambiguities is missing
    };

    const result = RequirementAnalysisSchema.safeParse(output);
    expect(result.success).toBe(false);
  });

  it("rejects an incorrect field type", () => {
    const output = {
      actor: "Customer",
      feature: "Cancel order",
      preconditions: "An order exists", // should be array of strings
      positiveScenarios: [],
      negativeScenarios: [],
      ambiguities: []
    };

    const result = RequirementAnalysisSchema.safeParse(output);
    expect(result.success).toBe(false);
  });

  it("rejects unexpected fields (strict contract enforcement)", () => {
    const output = {
      actor: "Customer",
      feature: "Cancel order",
      preconditions: [],
      positiveScenarios: [],
      negativeScenarios: [],
      ambiguities: [],
      confidence: 0.95 // unexpected field rejected by .strict()
    };

    const result = RequirementAnalysisSchema.safeParse(output);
    expect(result.success).toBe(false);
  });

  it("rejects an empty actor string", () => {
    const output = {
      actor: "", // violates min(1)
      feature: "Cancel order",
      preconditions: [],
      positiveScenarios: [],
      negativeScenarios: [],
      ambiguities: []
    };

    const result = RequirementAnalysisSchema.safeParse(output);
    expect(result.success).toBe(false);
  });
});

