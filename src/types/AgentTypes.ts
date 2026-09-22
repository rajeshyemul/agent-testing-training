export interface AgentConfig {
  agentId: string;
  name: string;
  version: string;
  model: string;
  temperature: number;
  instructions: string;
}

export interface AgentInput {
  input: string;
}

export interface AgentResult {
  agentId: string;
  agentVersion: string;
  output: string;
}