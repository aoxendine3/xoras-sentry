# 🛡️ XORAS Sentry (`xoras.live`)
### Zero-Trust Pre-Commit AST Scanner & Secret Leak Prevention

> **Stop leaked keys and hallucinated environment secrets before they leave your laptop.**

[![Production Live](https://img.shields.io/badge/Live-xoras.live-00f2ff?style=flat-square)](https://xoras.live)
[![NPM Core](https://img.shields.io/badge/npm-xoras--sentry-cb3837?style=flat-square)](https://www.npmjs.com/package/xoras-sentry)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## ⚡ What is XORAS Sentry?

`xoras-sentry` parses every file into an **Abstract Syntax Tree (AST)** rather than relying on brittle regex pattern matching. It catches real API keys, tokens, and private credentials in Next.js, Node, and TypeScript codebases before they can ever be committed or pushed to GitHub.

- **AST-Powered Precision**: Eliminates false positives by inspecting actual code semantics, variable declarations, and syntax tokens.
- **Dynamic `process.env` Hallucination Guard**: Traces hidden environment variables and flags unmapped server secrets attempting to slip into client bundles.
- **100% Local-First**: No code, tokens, or telemetry leave your machine.
- **Zero-Friction Git Integration**: Operates as a native pre-commit hook and automated GitHub Action check.

---

## 🚀 Quickstart

### 1. Instant Local Scan
Run an immediate audit across your current directory:
```bash
npx xoras-sentry .
```

### 2. Fast Delta Scan (Git Branch)
Scan only the modified delta files in your active branch (sub-millisecond execution):
```bash
npx xoras-sentry --delta
```

### 3. Generate Interactive Visual Report
Produce an interactive HTML compliance report:
```bash
npx xoras-sentry . --html
```

---

## 📦 Monorepo Architecture

```
xoras-sentry/
├── apps/
│   └── web/                # Next.js 16 web application backing https://xoras.live
├── packages/
│   ├── core/               # AST parser, cryptographic attestation, entropy analyzer
│   ├── cli/                # Terminal interface and executable binary
│   ├── ui/                 # Static report visualization engine
│   ├── integrations/       # Git pre-commit hooks and GitHub Actions runners
│   ├── api/                # TRPC audit routers
│   └── db/                 # Audit state and schema definitions
└── tests/                  # Deterministic unit and adversarial test suites
```

---

## 🛠️ Commands & Scripts

```bash
# Run unit & adversarial test suites
npm test

# Build production web bundle (Next.js Turbopack)
npm run build

# Run local pre-commit hook audit
npm run audit
```

---

## 🔒 Security & Support
To report vulnerabilities or request custom institutional deployment, review [SECURITY.md](SECURITY.md) or visit [xoras.live](https://xoras.live).
