import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("Requirement Analyzer - Nonsense Input Tests", () => {
  it("TC004 - should handle meaningless input without inventing a requirement", async () => {
    // --------------------------------
    // Load agent configuration
    // --------------------------------

    const loader = new AgentConfigLoader();

    const config = loader.load("./config/agents/requirement_analyzer.md");

    // --------------------------------
    // Create runtime
    // --------------------------------

    const runtime = new AgentRuntime(new LLMClient());

    // --------------------------------
    // Execute agent with nonsense input
    // --------------------------------

    const result = await runtime.run(config, {
      input: "asdfghjkl 123 xyz qwerty",
    });

    // --------------------------------
    // Display output
    // --------------------------------

    console.log("\n===== AGENT OUTPUT =====");
    console.log(result.output);
    console.log("========================\n");

    // --------------------------------
    // Agent execution
    // --------------------------------

    expect(result).toBeDefined();

    expect(result.agentId).toBe("requirement-analyzer");

    expect(result.output).toBeTruthy();

    // --------------------------------
    // Output must be valid JSON
    // --------------------------------

    let parsed: any;

    expect(() => {
      parsed = JSON.parse(result.output);
    }).not.toThrow();

    // --------------------------------
    // Required output fields
    // --------------------------------

    expect(parsed.actor).toBeDefined();

    expect(parsed.feature).toBeDefined();

    expect(parsed.preconditions).toBeInstanceOf(Array);

    expect(parsed.positiveScenarios).toBeInstanceOf(Array);

    expect(parsed.negativeScenarios).toBeInstanceOf(Array);

    expect(parsed.ambiguities).toBeInstanceOf(Array);

    // --------------------------------
    // Serialize output for
    // behavioral validation
    // --------------------------------

    const serializedOutput = JSON.stringify(parsed).toLowerCase();

    // --------------------------------
    // Agent should acknowledge that
    // meaningful information is unavailable
    // --------------------------------

    expect(serializedOutput).toMatch(
      /unknown|invalid|meaningless|insufficient|cannot be determined|not a requirement|not a software requirement|not specified|ambiguous/,
    );

    // --------------------------------
    // Agent should not create a
    // concrete software feature from
    // the nonsense input
    // --------------------------------

    expect(serializedOutput).not.toContain("password reset");

    expect(serializedOutput).not.toContain("login");

    expect(serializedOutput).not.toContain("shopping");
  });
});
