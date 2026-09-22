import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("Requirement Analyzer - Negative Tests", async () => {
  it("TC002 - should handle an empty requirement safely", async () => {
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
    // Execute agent with invalid input
    // --------------------------------
    const result = await runtime.run(config, {
      input: "",
    });

    // --------------------------------
    // Display output
    // --------------------------------

    console.log("\n===== AGENT OUTPUT =====");
    console.log(result.output);
    console.log("========================\n");

    // --------------------------------
    // Validate output contract
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
    // Agent should acknowledge
    // insufficient information
    // --------------------------------

    const serializedOutput = JSON.stringify(parsed).toLowerCase();
    expect(serializedOutput).toMatch(/unknown|missing|not specified|not provided|insufficient|empty|ambiguous/,);
  });
});
