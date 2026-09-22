import { describe, it, expect } from "vitest";
import { createRequirementAnalyzerFixture } from "@tests/support/requirementAnalyzerFixture.js";
import { expectAgentIdentity } from "@tests/assertions/agentAssertions.js";
import { expectRequirementAnalysisSchema } from "@tests/assertions/requirementAssertions.js";

describe("Requirement Analyzer - Functional Tests", () => {
  const analyzer = createRequirementAnalyzerFixture();

  it("TC001 - should analyze a valid password reset requirement", async () => {
    const execution = await analyzer.run(
      "The user should be able to reset their password using their registered email address."
    );

    // Level 1: Framework assertion
    expectAgentIdentity(execution);

    // Level 2: Contract assertion
    expectRequirementAnalysisSchema(execution.parsedOutput);

    // Level 3: Scenario functional behavior
    const parsed = execution.parsedOutput;
    expect(parsed.actor.toLowerCase()).toContain("user");
    expect(parsed.feature.toLowerCase()).toContain("password");
    expect(parsed.feature.toLowerCase()).toContain("reset");
    expect(parsed.preconditions.length).toBeGreaterThan(0);
    expect(parsed.positiveScenarios.length).toBeGreaterThan(0);
  });
});
