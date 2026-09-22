import { expect } from "vitest";

/**
 * Level 2 Contract Assertion:
 * Verifies that the parsed output conforms to the Requirement Analyzer schema contract,
 * ensuring all expected fields and types are present.
 */
export function expectRequirementAnalysisSchema(output: unknown): void {
  expect(output).toBeTypeOf("object");
  expect(output).not.toBeNull();

  const record = output as Record<string, unknown>;

  expect(record).toHaveProperty("actor");
  expect(record.actor).toBeTypeOf("string");

  expect(record).toHaveProperty("feature");
  expect(record.feature).toBeTypeOf("string");

  expect(record).toHaveProperty("preconditions");
  expect(Array.isArray(record.preconditions)).toBe(true);

  expect(record).toHaveProperty("positiveScenarios");
  expect(Array.isArray(record.positiveScenarios)).toBe(true);

  expect(record).toHaveProperty("negativeScenarios");
  expect(Array.isArray(record.negativeScenarios)).toBe(true);

  expect(record).toHaveProperty("ambiguities");
  expect(Array.isArray(record.ambiguities)).toBe(true);
}

