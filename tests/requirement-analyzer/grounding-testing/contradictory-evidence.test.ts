import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("TC009 - Contradictory Evidence", () => {

  it("should identify conflicting requirements instead of silently resolving them", async () => {

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
        "The profile picture must be stored locally on the user's device. " +
        "The profile picture must be stored in Amazon S3."
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
    // Assertion 4: Both conflicting storage
    // requirements should be represented
    // --------------------------------------------------

    expect(serializedOutput).toMatch(
      /locally|local storage|user's device|device/
    );

    expect(serializedOutput).toContain("s3");

    // --------------------------------------------------
    // Assertion 5: The contradiction should be
    // explicitly acknowledged
    // --------------------------------------------------

    expect(serializedOutput).toMatch(
      /conflict|contradict|inconsistent|incompatible|unclear|ambiguous/
    );

    // --------------------------------------------------
    // Assertion 6: The agent should not silently
    // resolve the contradiction
    // --------------------------------------------------

    expect(serializedOutput).not.toMatch(
      /therefore.*s3|therefore.*local|therefore.*device|must use s3|must use local storage|must be stored locally.*instead|must be stored in s3.*instead/
    );
  });
});