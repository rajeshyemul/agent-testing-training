import { AgentConfigLoader } from "@src/config/AgentConfigLoader.js";
import { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import { LLMClient } from "@src/llm/LLMClient.js";
import { AgentTestHarness } from "./agentTestHarness.js";
import type { AgentTestExecution, RequirementAnalysisOutput } from "./agentTestTypes.js";

export interface RequirementAnalyzerFixture {
  run(input: string): Promise<AgentTestExecution<RequirementAnalysisOutput>>;
}

/**
 * Creates a pre-configured fixture for testing the Requirement Analyzer Agent.
 * Reuses stateless infrastructure without leaking internal configuration or runtime references.
 */
export function createRequirementAnalyzerFixture(): RequirementAnalyzerFixture {
  const loader = new AgentConfigLoader();
  const config = loader.load("./config/agents/requirement_analyzer.md");
  const runtime = new AgentRuntime(new LLMClient());
  const harness = new AgentTestHarness(runtime);

  return {
    async run(input: string): Promise<AgentTestExecution<RequirementAnalysisOutput>> {
      return harness.run<RequirementAnalysisOutput>(config, { input });
    }
  };
}

