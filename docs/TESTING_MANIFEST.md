# TESTING MANIFEST: Infrastructure Quality Assurance

## 1. Overview
The `integrity-sentry-core` ecosystem is validated across multiple testing vectors to verify operational stability, deterministic secret discovery, and timing-safe signature handling across deployment environments.

## 2. Active Test Suites

### 2.1 Sandbox Production Attestation
- **Path:** `packages/core/tests/sandbox.test.cjs`
- **Objective:** Verify Vanguard production assets (4/4), AST scanner precision, Stripe signature timing-safety, and idempotency ledger.
- **Status:** PASSED (Exit Code: 0)

### 2.2 Infrastructure Gating (L4)
- **Path:** `tests/infrastructure_gate.test.cjs`
- **Objective:** Validate standardized exit codes and Node runtime environment parity (v24.15.0).
- **Status:** PASSED (Exit Code: 0)

### 2.3 Revenue Guard & Idempotency
- **Path:** `tests/revenue.test.cjs` & `tests/stripe_live_fire.test.cjs`
- **Objective:** Verify constant-time signature validation and duplicate webhook rejection for commercial transactions.
- **Status:** PASSED (Exit Code: 0)

### 2.4 Spectrum Adversarial Gating
- **Path:** `tests/spectrum.test.cjs`
- **Objective:** Defend against Symlink Tunneling (`lstatSync`), AST Shadowing, and recursive loop exhaustion (MAX_DEPTH 20).
- **Status:** PASSED (Exit Code: 0)

### 2.5 Environmental Secret Discovery
- **Path:** `tests/audit.test.cjs`
- **Objective:** Detect missing required variables and flag undocumented environment parameters.
- **Status:** PASSED (Exit Code: 0)

## 3. Coverage Summary
| Tranche | Vector | Status |
| :--- | :--- | :--- |
| **Security** | Hardcoded Secrets & Parameter Drift (AST) | 100% |
| **Resilience** | Memory/Timeout Protection & O(1) Indexing | 100% |
| **Revenue** | Idempotency / Timing-Safe Signature Guard | 100% |
| **Identity** | Vanguard Production Asset Attestation | 100% |
| **Adversarial** | Symlink Tunneling & Recursive Exhaustion Guard | 100% |
