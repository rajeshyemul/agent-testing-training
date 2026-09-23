import { expect } from "vitest";
import type { AgentTestExecution } from "@tests/support/agentTestTypes.js";

/**
 * Level 1 Framework Assertion:
 * Verifies that the agent identity, version, and execution payload are valid.
 */
export function expectAgentIdentity(
  execution: AgentTestExecution,
  expectedId = "requirement-analyzer",
  expectedVersion = "1.0.0"
): void {
  expect(execution).toBeDefined();
  expect(execution.result).toBeDefined();
  expect(execution.result.agentId).toBe(expectedId);
  expect(execution.result.agentVersion).toBe(expectedVersion);
  expect(execution.rawOutput).toBeTruthy();
}

