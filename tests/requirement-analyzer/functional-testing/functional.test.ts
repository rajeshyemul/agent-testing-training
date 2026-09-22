import { describe, it, expect } from "vitest";

import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";

describe("Requirement Analyzer - Functional Tests", () => {
  it("TC001 - should analyze a valid password reset requirement", async () => {
    const loader = new AgentConfigLoader();

    const config = loader.load("./config/agents/requirement_analyzer.md");

    const runtime = new AgentRuntime(new LLMClient());

    const result = await runtime.run(config, {
      input:
        "The user should be able to reset their password using their registered email address.",
    });

    console.log("\n===== AGENT OUTPUT =====");
    console.log(result.output);
    console.log("========================\n");

    // Agent execution

    expect(result).toBeDefined();

    expect(result.agentId).toBe("requirement-analyzer");

    expect(result.output).toBeTruthy();

    // Output contract
    let parsed: any;

    expect(() => {
      parsed = JSON.parse(result.output);
    }).not.toThrow();

    expect(parsed.actor).toBeTruthy();

    expect(parsed.feature).toBeTruthy();

    expect(parsed.preconditions).toBeInstanceOf(Array);

    expect(parsed.positiveScenarios).toBeInstanceOf(Array);

    expect(parsed.negativeScenarios).toBeInstanceOf(Array);

    expect(parsed.ambiguities).toBeInstanceOf(Array);

    // Functional behavior

    expect(parsed.actor.toLowerCase()).toContain("user");

    expect(parsed.feature.toLowerCase()).toContain("password");

    expect(parsed.feature.toLowerCase()).toContain("reset");

    expect(parsed.preconditions.length).toBeGreaterThan(0);

    expect(parsed.positiveScenarios.length).toBeGreaterThan(0);

    // expect(parsed.negativeScenarios.length).toBeGreaterThan(0);
  });
});
