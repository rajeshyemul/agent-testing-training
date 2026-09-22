import type {
  AgentConfig,
  AgentInput,
  AgentResult
} from "../types/AgentTypes.js";

import { LLMClient } from "../llm/LLMClient.js";

export class AgentRuntime {

  private readonly llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async run(
    config: AgentConfig,
    input: AgentInput
  ): Promise<AgentResult> {

    const output = await this.llmClient.generate(
      config.instructions,
      input.input,
      config.model
    );

    return {
      agentId: config.agentId,
      agentVersion: config.version,
      output
    };
  }
}