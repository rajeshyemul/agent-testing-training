import type { AgentResult } from "@src/types/AgentTypes.js";

/**
 * Expected schema contract for the Requirement Analyzer Agent.
 */
export interface RequirementAnalysisOutput {
  actor: string;
  feature: string;
  preconditions: string[];
  positiveScenarios: string[];
  negativeScenarios: string[];
  ambiguities: string[];
}

/**
 * Observation record produced by the Agent Test Harness.
 * Preserves the pristine LLM string alongside the normalized/parsed representation.
 */
export interface AgentTestExecution<T = RequirementAnalysisOutput> {
  result: AgentResult;
  rawOutput: string;
  parsedOutput: T;
}

