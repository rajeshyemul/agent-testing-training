import { z } from "zod";

export const RequirementAnalysisSchema = z
  .object({
    actor: z.string().min(1),
    feature: z.string().min(1),

    preconditions: z.array(z.string()),
    positiveScenarios: z.array(z.string()),
    negativeScenarios: z.array(z.string()),
    ambiguities: z.array(z.string())
  })
  .strict();

export type RequirementAnalysisOutput =
  z.infer<typeof RequirementAnalysisSchema>;