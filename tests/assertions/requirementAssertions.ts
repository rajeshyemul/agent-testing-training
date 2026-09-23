import { RequirementAnalysisSchema, type RequirementAnalysisOutput } from "@src/contracts/RequirementAnalysisSchema.js";

/**
 * Level 2 Contract Assertion:
 * Validates that the parsed object conforms strictly to the Requirement Analysis schema contract.
 * Returns the typed RequirementAnalysisOutput upon success.
 * Emits diagnostic messages detailing path and constraint violations upon failure.
 */
export function expectRequirementAnalysisSchema(output: unknown): RequirementAnalysisOutput {
  const validation = RequirementAnalysisSchema.safeParse(output);

  if (!validation.success) {
    throw new Error(
      [
        "Requirement Analysis output contract violation:",
        ...validation.error.issues.map(
          issue => `- ${issue.path.join(".") || "<root>"}: ${issue.message}`
        )
      ].join("\n")
    );
  }

  return validation.data;
}