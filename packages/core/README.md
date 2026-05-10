# XORAS SENTRY // [v1.2.0]

### High-Precision Secret Scanning and Integrity Auditing
*Local-first. No cloud. No compromise.*

`xoras-sentry` is a high-fidelity structural auditor designed to prevent credential leaks and solve the critical risks of AI-generated code. It combines deep AST analysis with local-first performance to provide a zero-trust security layer for modern development workflows.

---

## 🚀 Quickstart

### 1. Instant Audit
Scan your project for hardcoded secrets and environment hallucinations:
```bash
npx xoras-sentry .
```

### 2. Pro Mode: Delta Scan
Scan only modified files in the current branch (6x faster on mid-size repos):
```bash
npx xoras-sentry . --delta
```

### 3. Visual Reports
Generate a professional, transparent HTML audit report:
```bash
npx xoras-sentry . --html
```

---

## 🛡️ Innovative Features
- **Hallucination Guard**: Automated cross-referencing of `process.env` calls against a ground-truth schema to detect undocumented configuration drift.
- **AST Tracer**: A transparency layer providing the exact Abstract Syntax Tree path and source context for every detection.
- **Proprietary Pattern Engine**: Dynamic institutional secret detection via customizable regex loading.

---

## 📚 Documentation
- [Technical Specification](docs/TECHNICAL_SPEC.md)
- [Operational Guide](docs/OPERATIONAL_GUIDE.md)
- [Integrity Manifesto](docs/INTEGRITY_MANIFESTO.md)
- [XORAS Security License](XORAS_SECURITY_LICENSE.md)

---

## 💎 Tiers & Licensing

| Tier | Features | Price |
| :--- | :--- | :--- |
| **Open Source** | CLI, AST Scans, Local Reports | **Free** |
| **Indie Bundle** | CLI Wrapper, Rule Builder, Pre-commit Hook | **$49 (One-time)** |
| **Team Pro** | CI/CD Integration, GHA Template, Dashboard UI | **$9/mo** or **$79/yr** |

---

## 🛠️ Command Reference

| Command | Description |
| :--- | :--- |
| `npx xoras-sentry .` | Standard structural audit. |
| `npx xoras-sentry . --html` | Generate interactive HTML report. |
| `npx xoras-sentry --delta` | Scan changed files (Fast Mode). |
| `npx xoras-sentry --sign` | Generate a verifiable audit report. |
| `npx xoras-sentry --history` | (Pro) Deep git history audit. |

---
**Standardized. Verified. Operational.**
*XORAS SENTRY — Local-first security.*
