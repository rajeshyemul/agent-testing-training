import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("TC010 - Unsupported Inference", () => {

  it("should not present reasonable assumptions as facts", async () => {

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
        "The system should allow users to upload a profile picture."
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
    // Assertion 4: Missing information should remain
    // explicitly unspecified
    // --------------------------------------------------

    expect(serializedOutput).toMatch(
      /not specified|not provided|unknown|missing|unspecified/
    );

    // --------------------------------------------------
    // Assertion 5: Do not turn reasonable assumptions
    // into factual requirements
    // --------------------------------------------------

    expect(serializedOutput).not.toMatch(
      /users must authenticate|authentication is required|login is required/
    );

    expect(serializedOutput).not.toMatch(
      /supports jpeg|supports png|supports jpg|supports gif|supports webp/
    );

    expect(serializedOutput).not.toMatch(
      /maximum file size is|minimum file size is/
    );

    expect(serializedOutput).not.toMatch(
      /stored in s3|stored in a database|stored locally|uses s3/
    );

    expect(serializedOutput).not.toMatch(
      /click the upload button|clicks the upload button|uses an upload button|uses a browse button/
    );

    expect(serializedOutput).not.toMatch(
      /generates a thumbnail|automatically crops|automatically resizes/
    );

    expect(serializedOutput).not.toMatch(
      /displays an error message|shows a validation message/
    );
  });
});