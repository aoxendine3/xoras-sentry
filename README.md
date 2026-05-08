# XORAS // INTEGRITY_SENTRY_CORE [v1.1.0]

### Automated Credential Auditing and Configuration Security

The `integrity-sentry-core` scans your source code to identify exposed credentials and ensures your configuration matches its required structure. It is designed to be integrated into your CI/CD pipeline to prevent security leaks before they reach production.

---

## 🚀 Quickstart

### 1. Run an Instant Audit
Scan your current project for hardcoded secrets and environment mismatches:
```bash
npx integrity-sentry .
```

### 2. Scan Changed Files Only (Fast Mode)
In large projects, scan only the files you've modified in the current commit:
```bash
npx integrity-sentry . --delta
```

### 3. Non-Blocking Feedback
Run the scan without failing the build, receiving warnings for your local development workflow:
```bash
npx integrity-sentry . --warn-only
```

---

## 🛡️ Core Capabilities

- **Source Scanner**: Uses an AST-based parser to identify environment variables, including those accessed through template literals.
- **Audit History**: Maintains a verifiable history of all integrity scans and baseline updates.
- **Library Detection**: Automatically identifies and ignores third-party library code to reduce report noise.
- **Artifact Signing**: Cryptographically signs audit reports to ensure they haven't been tampered with.

---

## Command Reference

| Command | Description |
| :--- | :--- |
| `npx integrity-sentry .` | Standard structural audit. |
| `npx integrity-sentry --verify` | Verify current code against the baseline. |
| `npx integrity-sentry --delta` | Scan changed files only. |
| `npx integrity-sentry --warn-only` | Receive warnings without failing the build. |
| `npx integrity-sentry --sign` | Generate a signed, verifiable audit report. |

---
**Standardized. Verified. Operational.**
