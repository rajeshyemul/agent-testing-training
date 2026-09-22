import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("Requirement Analyzer - True Ambiguity Tests", () => {
  it("TC006 - should identify multiple interpretations in an ambiguous requirement", async () => {
    const loader = new AgentConfigLoader();

    const config = loader.load("./config/agents/requirement_analyzer.md");

    const runtime = new AgentRuntime(new LLMClient());

    const result = await runtime.run(config, {
      input:
        "The system should allow customers to cancel an order within one day of placing it.",
    });

    console.log("\n===== AGENT OUTPUT =====");
    console.log(result.output);
    console.log("========================\n");

    // --------------------------------
    // Basic execution checks
    // --------------------------------

    expect(result).toBeDefined();

    expect(result.agentId).toBe("requirement-analyzer");

    expect(result.output).toBeTruthy();

    // --------------------------------
    // JSON contract
    // --------------------------------

    let parsed: any;

    expect(() => {
      parsed = JSON.parse(result.output);
    }).not.toThrow();

    expect(parsed.actor).toBeDefined();

    expect(parsed.feature).toBeDefined();

    expect(parsed.preconditions).toBeInstanceOf(Array);

    expect(parsed.positiveScenarios).toBeInstanceOf(Array);

    expect(parsed.negativeScenarios).toBeInstanceOf(Array);

    expect(parsed.ambiguities).toBeInstanceOf(Array);

    // --------------------------------
    // Requirement understanding
    // --------------------------------

    expect(parsed.actor.toLowerCase()).toContain("customer");

    expect(parsed.feature.toLowerCase()).toContain("cancel");

    expect(parsed.feature.toLowerCase()).toContain("order");

    // --------------------------------
    // Ambiguity must be detected
    // --------------------------------

    expect(parsed.ambiguities.length).toBeGreaterThan(0);

    const ambiguityText = JSON.stringify(parsed.ambiguities).toLowerCase();

    expect(ambiguityText).toMatch(
      /one day|24 hours|calendar day|time|deadline|duration|period/,
    );

    // --------------------------------
    // Agent must preserve uncertainty
    // --------------------------------

    /*
     * The agent may mention possible interpretations
     * such as "24 hours" or "calendar day".
     *
     * However, it must not present one interpretation
     * as an established fact from the requirement.
     *
     * For this first version of the test we verify
     * that ambiguity is explicitly acknowledged.
     */

    expect(ambiguityText).toMatch(
      /ambiguous|unclear|not specified|not defined|could mean|may mean|uncertain|interpret/,
    );
  });
});
