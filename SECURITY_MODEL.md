# 🛡️ SECURITY MODEL: Bounded Determinism (v1.0_Ω)

## 1. Philosophy: Integrity over Hyperbole
The `integrity-sentry-core` is built on the principle of **Deterministic Scoped-Detection**. We do not claim "Absolute Resolution." Instead, we provide a repeatable, structurally-aware audit of environment variable usage within a defined and evolving rule set.

## 2. Detection Scope
### What we Detect (Deterministic)
- **Direct Access**: `process.env.KEY`
- **Computed Access**: `process.env['KEY']`
- **Destructuring**: `const { KEY } = process.env`
- **Known Secret Patterns**: Regular expression patterns for AWS, Stripe, etc.

### What is Out of Scope (Non-Deterministic)
- **Advanced Obfuscation**: Deliberate attempts to hide keys via string manipulation or external fetching.
- **Dynamic Variable Injection**: Keys injected at runtime via non-standard wrappers.
- **Zero-Day Secret Patterns**: Newly released service keys not yet in our definition set.

## 3. Resilience Guardrails
To ensure CI/CD stability, the sentry enforces strict resource limits:
- **Time Ceiling**: 200ms per-file scan limit.
- **Memory Ceiling**: O(1) complexity via line-streaming.
- **Findings Ceiling**: 1,000 findings per audit to prevent flood-attacks.

## 4. Trust & Credibility
We maintain a **Transparent Fault Baseline**. If a vulnerability is found within our defined scope that the sentry missed, it is treated as a **Critical Logic Error** and remediated via an update to the AST engine.

---
**"Security is a process, not a destination."**
