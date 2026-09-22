import type { AgentConfig, AgentInput } from "@src/types/AgentTypes.js";
import type { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import type { AgentTestExecution, RequirementAnalysisOutput } from "./agentTestTypes.js";

/**
 * Normalizes presentation artifacts (e.g. markdown code fences, outer whitespace)
 * without attempting to repair semantic or malformed JSON syntax errors.
 */
export function normalizeJsonOutput(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

/**
 * Generic Agent Test Harness.
 * Responsible for agent execution, capturing raw model output, normalizing presentation
 * artifacts, and parsing structured outputs.
 */
export class AgentTestHarness {
  constructor(private readonly runtime: AgentRuntime) {}

  async run<T = RequirementAnalysisOutput>(
    config: AgentConfig,
    input: AgentInput
  ): Promise<AgentTestExecution<T>> {
    const result = await this.runtime.run(config, input);

    // Genuinely raw output from the model
    const rawOutput = result.output;

    // Normalize presentation fences before parsing
    const cleanedOutput = normalizeJsonOutput(rawOutput);
    const parsedOutput = JSON.parse(cleanedOutput) as T;

    return {
      result,
      rawOutput,
      parsedOutput
    };
  }
}

