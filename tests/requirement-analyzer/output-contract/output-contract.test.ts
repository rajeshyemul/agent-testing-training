import { describe, it } from "vitest";
import { createRequirementAnalyzerFixture } from "@tests/support/requirementAnalyzerFixture.js";
import { expectAgentIdentity } from "@tests/assertions/agentAssertions.js";
import { expectRequirementAnalysisSchema } from "@tests/assertions/requirementAssertions.js";

describe("Requirement Analyzer - Output Contract", () => {
  const analyzer = createRequirementAnalyzerFixture();

  it("TC011 - should return output conforming to the requirement analysis contract", async () => {
    const execution = await analyzer.run(
      "The system should allow customers to cancel an order within one day of placing it."
    );

    // Level 1: Framework assertion
    expectAgentIdentity(execution);

    // Level 2: Strict Zod schema contract assertion
    expectRequirementAnalysisSchema(execution.parsedOutput);
  });
});

