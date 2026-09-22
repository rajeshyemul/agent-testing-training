import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("TC008 - Grounding / Explicit Details", () => {

  it("should use explicitly provided technical details without inventing additional ones", async () => {

    const loader = new AgentConfigLoader();

    const config = loader.load(
      "config/agents/requirement_analyzer.md"
    );

    const runtime = new AgentRuntime(
      new LLMClient()
    );

    // One model execution
    const result = await runtime.run(config, {
      input:
        "The system should allow users to upload a profile picture. " +
        "The picture must be stored in Amazon S3."
    });

    // --------------------------------------------------
    // Assertion 1: Correct agent
    // --------------------------------------------------

    expect(result.agentId).toBe(
      "requirement-analyzer"
    );

    // --------------------------------------------------
    // Parse model output
    // --------------------------------------------------

    let parsed: any;

    expect(() => {
      parsed = JSON.parse(result.output);
    }).not.toThrow();

    const serializedOutput =
      JSON.stringify(parsed).toLowerCase();

    // --------------------------------------------------
    // Assertion 2: Correct actor
    // --------------------------------------------------

    expect(serializedOutput).toContain("user");

    // --------------------------------------------------
    // Assertion 3: Correct feature
    // --------------------------------------------------

    expect(serializedOutput).toContain("profile");
    expect(serializedOutput).toContain("picture");

    // --------------------------------------------------
    // Assertion 4: Explicit technical detail
    // --------------------------------------------------

    expect(serializedOutput).toContain("s3");

    // --------------------------------------------------
    // Assertion 5: Additional technical details
    // should remain unspecified
    // --------------------------------------------------

    expect(serializedOutput).toMatch(
      /not specified|not provided|unknown|missing|unspecified/
    );

    // --------------------------------------------------
    // Assertion 6: Agent should not invent
    // additional storage implementation details
    // --------------------------------------------------

    expect(serializedOutput).not.toMatch(
      /bucket name is|bucket named|stored in.*region|region is|uses encryption|encrypted with|retention period is|cdn|cloudfront/
    );
  });
});