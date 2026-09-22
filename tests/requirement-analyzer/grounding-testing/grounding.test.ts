import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("TC007 - Grounding / Hallucination Resistance", () => {
  it("should stay grounded when the requirement provides sparse information", async () => {
    const loader = new AgentConfigLoader();

    const config = loader.load("config/agents/requirement_analyzer.md");

    const runtime = new AgentRuntime(new LLMClient());

    // One model execution
    const result = await runtime.run(config, {
      input: "The system should allow users to upload a profile picture.",
    });

    // --------------------------------------------------
    // Assertion 1: Correct agent
    // --------------------------------------------------

    expect(result.agentId).toBe("requirement-analyzer");

    // --------------------------------------------------
    // Parse model output
    // --------------------------------------------------

    let parsed: any;

    expect(() => {
      parsed = JSON.parse(result.output);
    }).not.toThrow();

    const serializedOutput = JSON.stringify(parsed).toLowerCase();

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
    // Assertion 4: Agent acknowledges unspecified details
    // --------------------------------------------------

    expect(serializedOutput).toMatch(
      /not specified|not provided|unknown|missing|unspecified/,
    );

    // --------------------------------------------------
    // Assertion 5: Agent should not assert unsupported
    // technical details as facts
    // --------------------------------------------------

    expect(serializedOutput).not.toMatch(
      /supports jpeg|supports png|supports gif|supports webp/,
    );

    expect(serializedOutput).not.toMatch(
      /maximum file size is|minimum file size is/,
    );

    expect(serializedOutput).not.toMatch(
      /stored in s3|stored in a database|uses s3|uses a database/,
    );

    expect(serializedOutput).not.toMatch(
      /resolution is \d+|dimensions are \d+/,
    );

    // --------------------------------------------------
    // Assertion 6: Agent should not invent UI or
    // business behavior
    // --------------------------------------------------

    expect(serializedOutput).not.toMatch(
      /requires drag and drop|requires a browse button|requires an upload button/,
    );

    expect(serializedOutput).not.toMatch(
      /displays an error message|shows a validation message/,
    );

    expect(serializedOutput).not.toMatch(
      /generates a thumbnail|automatically crops|automatically resizes/,
    );
  });
});
