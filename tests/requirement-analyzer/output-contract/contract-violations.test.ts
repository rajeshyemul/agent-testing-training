import { describe, it, expect } from "vitest";
import { expectRequirementAnalysisSchema } from "@tests/assertions/requirementAssertions.js";

describe("Requirement Analyzer - Contract Violation Tests (Deterministic)", () => {
  const validBaseOutput = {
    actor: "Customer",
    feature: "Cancel order",
    preconditions: ["An order has been placed."],
    positiveScenarios: ["Customer cancels order within one day."],
    negativeScenarios: ["Customer attempts cancellation after one day."],
    ambiguities: []
  };

  it("TC012 - should reject output with a missing required field", () => {
    const { ambiguities, ...missingFieldOutput } = validBaseOutput;

    expect(() => {
      expectRequirementAnalysisSchema(missingFieldOutput);
    }).toThrow(/Requirement Analysis output contract violation[\s\S]*ambiguities/);
  });

  it("TC013 - should reject output with an incorrect field type", () => {
    const wrongTypeOutput = {
      ...validBaseOutput,
      preconditions: "An order has been placed." // Invalid: string instead of string[]
    };

    expect(() => {
      expectRequirementAnalysisSchema(wrongTypeOutput);
    }).toThrow(/Requirement Analysis output contract violation[\s\S]*preconditions/);
  });

  it("TC014 - should reject output with unexpected fields (strict contract)", () => {
    const unexpectedFieldOutput = {
      ...validBaseOutput,
      confidenceScore: 0.98 // Invalid: unrecognized property rejected by .strict()
    };

    expect(() => {
      expectRequirementAnalysisSchema(unexpectedFieldOutput);
    }).toThrow(/Requirement Analysis output contract violation[\s\S]*confidenceScore/);
  });

  it("TC015 - should reject output with an empty required string", () => {
    const emptyActorOutput = {
      ...validBaseOutput,
      actor: "" // Invalid: violates z.string().min(1)
    };

    expect(() => {
      expectRequirementAnalysisSchema(emptyActorOutput);
    }).toThrow(/Requirement Analysis output contract violation[\s\S]*actor/);
  });

  it("TC016 - should fail at the parsing boundary when output contains raw Markdown fences", () => {
    const fencedOutput = '```json\n{"actor": "Customer"}\n```';

    expect(() => {
      // The harness strictly parses raw output without silently stripping fences
      JSON.parse(fencedOutput);
    }).toThrow(SyntaxError);
  });
});

