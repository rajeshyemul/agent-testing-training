import type { AgentConfig, AgentInput } from "@src/types/AgentTypes.js";
import type { AgentRuntime } from "@src/runtime/AgentRuntime.js";
import type { AgentTestExecution } from "./agentTestTypes.js";

/**
 * Generic Agent Test Harness.
 * Responsible for agent execution, capturing raw model output, and strict JSON parsing.
 * Does not silently repair presentation or contract violations (e.g. markdown fences).
 */
export class AgentTestHarness {
  constructor(private readonly runtime: AgentRuntime) {}

  async run(
    config: AgentConfig,
    input: AgentInput
  ): Promise<AgentTestExecution> {
    const result = await this.runtime.run(config, input);

    // Genuinely raw output from the model
    const rawOutput = result.output;

    // Strict JSON parsing directly against raw output
    const parsedOutput: unknown = JSON.parse(rawOutput.trim());

    return {
      result,
      rawOutput,
      parsedOutput
    };
  }
}
