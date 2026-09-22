import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("Requirement Analyzer - Ambiguity Tests", () => {
  it("TC005 - should identify ambiguity in an unclear requirement", async () => {
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
    // Execute agent
    // --------------------------------

    const result = await runtime.run(config, {
      input:
        "The system should allow users to reset their password quickly using email.",
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
    // Functional meaning
    // --------------------------------

    expect(parsed.actor.toLowerCase()).toContain("user");

    expect(parsed.feature.toLowerCase()).toContain("password");

    expect(parsed.feature.toLowerCase()).toContain("reset");

    // --------------------------------
    // Ambiguity must be detected
    // --------------------------------

    expect(parsed.ambiguities.length).toBeGreaterThan(0);

    const ambiguityText = JSON.stringify(parsed.ambiguities).toLowerCase();

    // "quickly" should be recognized
    // as an undefined requirement.

    expect(ambiguityText).toMatch(
      /quick|time|duration|response|deadline|performance|unspecified|undefined/,
    );
  });
});
