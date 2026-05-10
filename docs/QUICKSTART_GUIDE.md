# XORAS SENTRY // Quickstart Guide

### Security starts locally.

This guide covers best practices for integrating XORAS SENTRY into your development workflow to ensure zero credential leakage.

---

## 🚀 1. Installation
Ensure you have Node.js (v18+) installed. Install the CLI globally:
```bash
npm install -g xoras-sentry
```

## 🛡️ 2. Running Your First Audit
Navigate to your project root and run:
```bash
xoras-sentry .
```
This will perform a full structural audit using AST resolution.

## ⚡ 3. The Indie Workflow (Recommended)
### Block Leaks at the Source
Install the pre-commit hook to automatically audit changed files before every commit:
```bash
node scripts/install-hook.cjs
```

### Generate Professional Reports
Use the `--html` flag to generate a client-ready audit report:
```bash
xoras-sentry . --html
```

---

## 🔑 Best Practices for Secret Management

1. **Never commit `.env` files**: Ensure `.env` is in your `.gitignore`.
2. **Use Template Literals with Caution**: XORAS SENTRY will catch them, but static keys are always safer.
3. **Rotate Keys Regularly**: If Sentry identifies a leak, rotate the key immediately even if it hasn't been pushed to GitHub yet.
4. **Leverage `.sentry-ignore`**: Use the rule builder (`node scripts/build-ignore.cjs`) to manage safe-key exceptions and reduce noise.

---
**Standardized. Verified. Operational.**
*XORAS SENTRY — Local-first security.*
