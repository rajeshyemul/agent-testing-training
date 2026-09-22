import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("Requirement Analyzer - Scope Tests", () => {
  it("TC003 - should not invent a software requirement from unrelated input", async () => {
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
    // Execute agent with
    // unrelated input
    // --------------------------------

    const result = await runtime.run(config, {
      input: "Bananas are yellow and elephants are large.",
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
    // Scope / hallucination check
    // --------------------------------

    const serializedOutput = JSON.stringify(parsed).toLowerCase();

    // Agent should NOT invent a software feature
    // related to the unrelated input.

    expect(serializedOutput).not.toContain("banana management");

    expect(serializedOutput).not.toContain("elephant management");

    // --------------------------------
    // Agent should indicate that
    // meaningful requirement information
    // is unavailable or invalid.
    // --------------------------------

    expect(serializedOutput).toMatch(/unknown|invalid|not a requirement|not a software requirement|insufficient|unrelated|ambiguous|cannot be determined|not specified/,);
  });
});
