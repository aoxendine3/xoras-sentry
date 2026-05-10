# XORAS SENTRY // TECHNICAL SPECIFICATION [v1.2]

## 1. Abstract Syntax Tree (AST) Analysis
XORAS SENTRY utilizes the **Acorn** parser to generate a full Abstract Syntax Tree of all scanned JavaScript and TypeScript source files. This allows for structural identification of secrets that regex-only scanners miss.

### 1.1 Structural Resolution
The scanner resolves the following nodes:
- **MemberExpression**: Identifying `process.env` accessors.
- **Literal**: Detecting static strings that match secret patterns.
- **TemplateLiteral**: Resolving dynamic keys (e.g., `${'STRIPE'}_KEY`).
- **Property**: Detecting secrets in object definitions.

## 2. Hallucination Guard
The Hallucination Guard is an innovative pre-check layer designed for AI-generated code environments.

### 2.1 Logic
1. During AST traversal, every unique identifier accessed via `process.env` is recorded.
2. These identifiers are cross-referenced against the `.sentry-schema.json`.
3. If an identifier exists in the code but is missing from the schema, it is flagged as a **LOW: Potential Hallucination**.

## 3. AST Tracer (Transparency Layer)
To resolve the 'Black Box' problem, the AST Tracer provides metadata for every finding.

### 3.1 Metadata Fields
- **Type**: The AST node type (e.g., `Literal`, `MemberExpression`).
- **Location**: Line and column numbers of the exact detection.
- **Description**: Human-readable explanation of the detection logic.
- **Context**: A snippet of the surrounding source code for immediate verification.

## 4. Proprietary Pattern Engine
Organizations can define internal secret formats in the `customPatterns` array within `.sentry-schema.json`.

### 4.1 Merging Strategy
Custom patterns are merged with default institutional patterns at runtime. This allows for zero-configuration detection of proprietary keys while maintaining a global security baseline.

---
**Standardized. Verified. Operational.**
