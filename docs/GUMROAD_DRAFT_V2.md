# XORAS SENTRY // High-Precision Secret Scanning

### Hardcoded secrets are a liability. Stop the leak before it costs you.

One leaked API key can cost thousands in unauthorized usage and irreparable brand damage. **XORAS SENTRY** is a lightweight, local-first CLI tool that identifies exposed credentials in your source code using AST-level analysis. No cloud accounts, no data uploads, no monthly per-repo tax.

---

## 🛠️ Technical Capabilities

### 1. AST-Level Precision
Unlike simple regex scanners that produce high false positives, XORAS SENTRY uses a deep AST (Abstract Syntax Tree) parser. It resolves:
- **Member Expressions**: `process.env.API_KEY`
- **Computed Keys**: `process.env['SECRET']`
- **Dynamic Template Literals**: `process.env[`${'STRIPE'}_KEY`]`
- **Hallucination Guard**: Automated cross-referencing of `process.env` calls against a ground-truth schema to detect undocumented configuration drift.
- **AST Tracer**: A transparency layer providing the exact Abstract Syntax Tree path and source context for every detection.

### 2. Fast-Path Optimization
Our structural engine is optimized for speed. In benchmarks on mid-size repositories, XORAS SENTRY is **6x faster** than standard AST walking scanners, thanks to our intelligent pre-parse regex heuristics.

### 3. Local-First Privacy
- **100% Offline**: Runs entirely on your machine.
- **Air-Gapped Ready**: Ideal for secure institutional environments.
- **No Telemetry**: Your code never leaves your local environment.

---

## 🆚 How We Compare
| Feature | XORAS SENTRY | Snyk | Trufflehog | Semgrep |
| :--- | :---: | :---: | :---: | :---: |
| **AST-Level Precision** | ✅ | ✅ | ❌ | ✅ |
| **Schema Validation** | ✅ | ❌ | ❌ | ❌ |
| **Local-First (No Cloud)** | ✅ | ❌ | ✅ | ✅ |
| **HTML Audit Reports** | ✅ | ✅ | ❌ | ❌ |
| **Commercial Protection** | ✅ | ✅ | ❌ | ✅ |
| **No Account Required** | ✅ | ❌ | ✅ | ✅ |

*Note: Competitor data based on published documentation as of May 2026. Spot-check recommended for recent updates.*

---

## 💎 Choose Your Tier

### **Free Tier (Open Source)**
*Foundation-level security for every project.*
- Full CLI Access (`xoras-sentry`)
- AST-based Source Scanning
- Local JSON Reports
- **[ Get it on GitHub ]**

### **Indie Bundle — $49 (One-Time)**
*The essential toolkit for solo developers.*
- **Everything in Free**
- **Pre-commit Hook Installer**: Automatically block leaks before they are committed.
- **HTML Audit Reports**: Professional, readable security summaries for clients.
- **Quickstart Guide (Markdown)**: Best practices for credential rotation and vaulting.
- **[ Purchase Indie Bundle ]**

### **Team Pro — $9/month or $79/year**
*Professional-grade enforcement for teams.*
- **Everything in Indie Bundle**
- **GitHub Actions Workflow**: Automated enforcement on every Pull Request.
- **.sentry-ignore Rule Builder**: Intelligent UI for managing safe-key exceptions.
- **Priority Support**: Direct access to the XORAS engineering team.
- **[ Subscribe to Pro ]**

---

## ❓ Frequently Asked Questions

**Does it require a cloud account?**
No. XORAS SENTRY is local-first. You download it, you run it, you own it.

**Are there per-repo or per-user limits?**
No. Once you have the CLI, you can scan an unlimited number of repositories and projects.

**What are the requirements?**
XORAS SENTRY requires Node.js (v18+) and works across macOS, Linux, and Windows.

**How is this different from Trufflehog or detect-secrets?**
While those tools are excellent, XORAS SENTRY is built specifically for modern JS/TS environments with a focus on deep AST resolution and minimal local overhead.

**Is this tool language-agnostic?**
XORAS SENTRY is currently optimized for JavaScript and TypeScript projects (Node.js ecosystem). Support for additional languages and frameworks is on the roadmap.

### **[ GET XORAS SENTRY — $49 ]**
*Precision Auditing. Zero Leaks. Local-First Security.*

---
**Standardized. Verified. Operational.**
*XORAS SENTRY — Local-first. No cloud. No compromise.*
