# Agent Testing & Quality Engineering (QE) Platform

A configuration-driven AI agent platform built from first principles to build the foundation for testing, evaluation, and benchmarking AI agent behavior.

Rather than treating Large Language Models as black-box chatbots or testing single hard-coded API calls, this platform provides an architectural foundation for **Agent Quality Engineering (Agent QE)**: evaluating behavioral contracts, runtime orchestration, semantic outputs, negative boundaries, ambiguity handling, grounding guardrails, runtime output contracts, and regressions.

---

## 🏛️ The 4-Layer Architecture

The platform separates agent definitions, execution runtime, model access, and test evaluation:

```mermaid
flowchart TD
    subgraph Layer 1: Agent Definition
        MD["config/agents/requirement_analyzer.md\n(YAML Frontmatter + Behavioral Prompt)"]
    end

    subgraph Layer 2: Agent Runtime
        Loader["AgentConfigLoader\n(Parses Frontmatter & Instructions)"]
        Runtime["AgentRuntime\n(Dependency Injected Orchestrator)"]
    end

    subgraph Layer 3: Model Gateway
        LLM["LLMClient\n(Gemini Gateway via OpenAI-Compatible API)"]
        API[("Gemini API\n(Live Inference)")]
    end

    subgraph Layer 4: Evaluation & Testing
        Harness["AgentTestHarness\n(Captures Raw Output & Strict Parse)"]
        Contract["Output Contract Validator\n(RequirementAnalysisSchema - Zod)"]
        Oracle["Semantic & Behavioral Oracles\n(Vitest Assertions)"]
    end

    MD --> Loader
    Loader --> Runtime
    Runtime --> LLM
    LLM --> API
    API --> LLM
    LLM --> Runtime
    Runtime --> Harness
    Harness --> Contract
    Contract --> Oracle
```

### Layer Breakdown

1. **Layer 1 — Agent Definition (`config/agents/*.md`)**  
   The behavioral contract of the agent written in Markdown with YAML frontmatter. Defines identity (`agentId`, `version`), target model parameters (`model`, `temperature: 0`), operational role, negative rules, and output format.
2. **Layer 2 — Agent Runtime (`src/runtime/`, `src/config/`)**  
   TypeScript execution engine. Completely agnostic to the agent's domain logic. Loads configs, prepares execution context, propagates configuration parameters (including `temperature`), calls the injected LLM gateway, and wraps output into typed `AgentResult` execution payloads.
3. **Layer 3 — Model Gateway (`src/llm/LLMClient.ts`)**  
   LLM gateway that currently connects to Google Gemini through its OpenAI-compatible API. The runtime depends on the gateway rather than directly depending on a model provider, allowing provider abstraction to evolve independently.
4. **Layer 4 — Evaluation & Testing (`tests/`, `src/contracts/`)**  
   Structured into three distinct tiers:
   - **Test Harness & Fixtures (`tests/support/`)**: Decouples execution and observation (`rawOutput` and `parsedOutput`) from tests.
   - **Runtime Output Contract (`src/contracts/`)**: Validates schema, field types, and strict keys using Zod before semantic assertions run.
   - **Assertion Hierarchy (`tests/assertions/`)**: Framework assertions (identity), contract assertions (schema), and scenario assertions (semantic/grounding/ambiguity).

---

## 🎯 Stage 1 — Requirement Analyzer Agent

The first agent built and evaluated on this platform is the **Requirement Analyzer Agent**.

### Input
A software requirement text string. Example:
> *"The user should be able to reset their password using their registered email address."*

### Contract Responsibilities
The agent is tasked to extract:
* **Actor**: The entity performing the action.
* **Feature**: The core software functionality.
* **Preconditions**: States that must be true prior to execution.
* **Positive Scenarios**: Happy path behaviors.
* **Negative Scenarios**: Failure and boundary conditions.
* **Ambiguities**: Underspecified logic, missing requirements, or multiple interpretations.

### Executable Output Schema (Contract)
Defined in [`src/contracts/RequirementAnalysisSchema.ts`](file:///Users/rajesh.yemul/agent-testing-training/src/contracts/RequirementAnalysisSchema.ts) and strictly enforced at runtime via Zod:
```typescript
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
```

---

## 🧪 Agent QE Philosophy: The Evaluation Pipeline

In traditional software testing, tests assert deterministic equality:
```typescript
expect(output).toBe("Login successful"); // Deterministic equality
```

For AI agents, natural-language model outputs may vary in wording even when the underlying behavior is equivalent, making exact string matching brittle:
* The model might say `"User"` in one run and `"user"` in another.
* Both are functionally correct. Exact string equality produces false alarms and test flakiness.

### The Agent QE Evaluation Flow

```text
               Agent Execution
                      │
                      ▼
                 rawOutput
                      │
            [ Strict JSON Parsing ]
                      │
                      ▼
                parsedOutput (unknown)
                      │
             [ Zod Schema Contract ]
             /                     \
           FAIL                    PASS
            │                       │
      Contract Error          Semantic Oracle
     (Path & Violations)     (Grounding, Ambiguity,
                              Functional Behavior)
```

1. **Format Validation**: The model output must be valid JSON without markdown fences or wrapping artifacts.
2. **Contract Validation**: The parsed JSON must strictly satisfy the 6 fields and types defined by `RequirementAnalysisSchema.strict()`.
3. **Semantic Verification**: Testing whether the model understood the actor, feature, and intent (e.g. `expect(parsed.actor.toLowerCase()).toContain("user")`).
4. **Grounding & Scope Guardrails**: Ensuring the agent uses only provided facts and does not invent business rules, databases, or systems out of thin air.
5. **Preserving Uncertainty**: Verifying that when information is missing, ambiguous, or contradictory, the agent explicitly flags it rather than guessing.

---

## 📂 Test Matrix

The test suite is organized into distinct categories under `tests/`:

| Test Case | Category | File | What it Validates |
| :--- | :--- | :--- | :--- |
| **TC001** | Functional | `functional-testing/functional.test.ts` | Schema and semantic understanding of a valid password reset requirement. |
| **TC002** | Negative / Robustness | `negative-testing/negative.test.ts` | Empty input (`""`) and graceful degradation acknowledging missing information. |
| **TC003** | Scope / Hallucination | `negative-testing/scope.test.ts` | Unrelated input (*"Bananas and elephants"*); prevents inventing software features. |
| **TC004** | Nonsense Input | `negative-testing/nonsense.test.ts` | Meaningless gibberish input; ensures agent safely acknowledges lack of requirement. |
| **TC005** | Ambiguity | `ambiguity-testing/ambiguity.test.ts` | Identifies subjective/underspecified language (*"quickly"*). |
| **TC006** | True Ambiguity | `ambiguity-testing/true-ambiguity.test.ts` | Preserves multiple valid interpretations (*"within one day"* - 24 hours vs calendar day). |
| **TC007** | Grounding | `grounding-testing/grounding.test.ts` | Preserves unknowns when evidence is sparse (*"upload a profile picture"*). |
| **TC008** | Grounding | `grounding-testing/explicit-details.test.ts` | Uses explicit technical evidence (*"Amazon S3"*) without losing it or inventing extras. |
| **TC009** | Grounding | `grounding-testing/contradictory-evidence.test.ts` | Detects and surfaces conflicting requirements (local device storage vs cloud S3). |
| **TC010** | Grounding | `grounding-testing/unsupported-inference.test.ts` | Prevents presenting reasonable assumptions as established facts. |
| **TC011** | Output Contract | `output-contract/output-contract.test.ts` | Live agent output strictly satisfies the Zod output schema contract. |
| **TC012** | Contract Violation | `output-contract/contract-violations.test.ts` | Rejects output with missing required fields (deterministic). |
| **TC013** | Contract Violation | `output-contract/contract-violations.test.ts` | Rejects output with incorrect field types (deterministic). |
| **TC014** | Contract Violation | `output-contract/contract-violations.test.ts` | Rejects unexpected fields via `.strict()` contract enforcement (deterministic). |
| **TC015** | Contract Violation | `output-contract/contract-violations.test.ts` | Rejects empty required strings violating `min(1)` (deterministic). |
| **TC016** | Parsing Boundary | `output-contract/contract-violations.test.ts` | Rejects raw Markdown code fences failing strict JSON parsing. |

---

## 🧭 The Learning Journey

This repository tracks a progressive curriculum in Agent Quality Engineering:

```
Requirement Analysis
        ↓
Functional Correctness
        ↓
Negative Boundaries
        ↓
Ambiguity & Uncertainty
        ↓
Grounding & Evidence
        ↓
Output Contracts (Zod)
        ↓
From Reasoning to Acting
        ↓
Tool-Calling Agents
        ↓
Guardrails & Failure Containment
        ↓
Multi-Agent Contracts
        ↓
Evaluation & Regression
        ↓
Production Agent QE & Governance
```

---

## 📁 Project Structure

```
agent-testing-training/
├── .env.example                          # Environment configuration template
├── config/
│   └── agents/
│       └── requirement_analyzer.md       # Layer 1: Agent behavioral contract & prompt
├── src/
│   ├── config/
│   │   └── AgentConfigLoader.ts          # Markdown frontmatter parser (gray-matter)
│   ├── contracts/
│   │   └── RequirementAnalysisSchema.ts  # Runtime executable Zod schema contract
│   ├── llm/
│   │   └── LLMClient.ts                  # Layer 3: Model gateway (Gemini API via OpenAI SDK)
│   ├── runtime/
│   │   └── AgentRuntime.ts               # Layer 2: Dependency-injected runtime orchestrator
│   ├── types/
│   │   └── AgentTypes.ts                 # Compile-time TypeScript interfaces
│   └── index.ts                          # Manual execution entry point
├── tests/
│   ├── assertions/                       # 3-tier assertion helpers
│   │   ├── agentAssertions.ts            # Level 1: Framework assertions (identity)
│   │   └── requirementAssertions.ts      # Level 2: Contract assertions (Zod validation)
│   ├── contracts/                        # Schema unit tests (independent of LLM)
│   │   └── requirement-analysis-schema.test.ts
│   ├── support/                          # Test infrastructure
│   │   ├── agentTestHarness.ts           # Generic execution & strict parsing harness
│   │   ├── agentTestTypes.ts             # AgentTestExecution observation model
│   │   └── requirementAnalyzerFixture.ts # Encapsulated fixture for Requirement Analyzer
│   └── requirement-analyzer/             # Agent behavioral test suites
│       ├── functional-testing/           # Core functional requirement tests (TC001)
│       │   └── functional.test.ts
│       ├── negative-testing/             # Empty, scope, and nonsense tests (TC002-TC004)
│       │   ├── negative.test.ts
│       │   ├── nonsense.test.ts
│       │   └── scope.test.ts
│       ├── ambiguity-testing/            # Ambiguity and uncertainty tests (TC005-TC006)
│       │   ├── ambiguity.test.ts
│       │   └── true-ambiguity.test.ts
│       ├── grounding-testing/            # Grounding and evidence tests (TC007-TC010)
│       │   ├── grounding.test.ts
│       │   ├── explicit-details.test.ts
│       │   ├── contradictory-evidence.test.ts
│       │   └── unsupported-inference.test.ts
│       └── output-contract/              # Contract tests (TC011-TC016)
│           ├── output-contract.test.ts
│           └── contract-violations.test.ts
├── package.json
├── tsconfig.json                         # TypeScript compiler configuration & path aliases (@src/*, @tests/*)
└── vitest.config.ts                      # Test runner settings (timeouts & sequential execution for APIs)
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v20+ recommended
* **npm**: v10+
* **Gemini API Key**: A free key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rajeshyemul/agent-testing-training.git
   cd agent-testing-training
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env` and set your key:
   ```bash
   cp .env.example .env
   # Add your key to .env:
   # GEMINI_API_KEY=your_google_ai_studio_api_key_here
   ```

---

## 💻 Running the Project

### 1. Manual Agent Execution
Run the standalone execution of the Requirement Analyzer Agent:
```bash
npm run agent
```

### 2. Run the Automated Test Suites
Run all Vitest test suites:
```bash
npm test
```

Run contract validation unit tests (hermetic, zero LLM calls):
```bash
npx vitest run tests/contracts/
npx vitest run tests/requirement-analyzer/output-contract/contract-violations.test.ts
```

Run a specific test category or file:
```bash
npm test -- functional.test.ts
npm test -- output-contract.test.ts
npm test -- ambiguity.test.ts
npm test -- grounding.test.ts
npm test -- scope.test.ts
```

Run in interactive watch mode during development:
```bash
npm run test:watch
```

### 3. Build / Type Check
Verify TypeScript compilation and type definitions:
```bash
npm run build
```

---

## 🗺️ Learning & Implementation Roadmap

### Foundation
- [x] **Stage 1 — Configuration-Driven Agent Runtime**
- [x] **Stage 2 — Requirement Analyzer Agent Contract**
- [x] **Stage 3 — Functional Testing**
- [x] **Stage 3.5 — The AI Test Oracle**
- [x] **Stage 4 — Reasoning and Ambiguity Testing**

### Agent Behavior & Contracts
- [x] **Stage 7 — Grounding, Hallucination & Evidence (TC007–TC010)**
- [x] **Stage 9 — Output Contracts & Schema Boundary Testing (TC011–TC016)**
- [ ] **Stage 4.5 — From Reasoning to Acting**
- [ ] **Stage 5 — Tool-Calling Agents & Action Loops**
- [ ] **Stage 6 — Boundaries, Guardrails & Failure Containment**

### Agent Systems & Governance
- [ ] **Stage 8 — Multi-Agent Testing & Agent Contracts**
- [ ] **Stage 10 — Production Agent QE & CI/CD Quality Gates**
