import type { AgentResult } from "@src/types/AgentTypes.js";
import type { RequirementAnalysisOutput } from "@src/contracts/RequirementAnalysisSchema.js";

export type { RequirementAnalysisOutput };

/**
 * Observation record produced by the Agent Test Harness.
 * Holds the pristine raw LLM output and the unvalidated parsed JSON (unknown).
 * Validation against Zod contracts happens in the evaluation layer.
 */
export interface AgentTestExecution {
  result: AgentResult;
  rawOutput: string;
  parsedOutput: unknown;
}
