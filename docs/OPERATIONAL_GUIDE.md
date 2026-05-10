# XORAS SENTRY // OPERATIONAL GUIDE

## 🏁 Quickstart
1. **Initialize**: `npx xoras-sentry init`
2. **Audit**: `npx xoras-sentry .`
3. **Report**: `npx xoras-sentry . --html`

## 🛡️ Team Deployment (Team Pro)
XORAS SENTRY is optimized for high-frequency team environments.

### 1. Unified Schema
Distribute a single `.sentry-schema.json` across all team repositories. This ensures every developer (and every AI agent) is working against the same Ground Truth.

### 2. CI/CD Integration
Add XORAS SENTRY to your GitHub Actions or Jenkins pipeline. Use the `--json` flag to feed audit results into your security dashboard.

```yaml
- name: XORAS Audit
  run: npx xoras-sentry . --json > report.json
```

### 3. Local-First Compliance
Ensure all developers have the pre-commit hook installed. This enforces the **Zero Leakage** mandate at the workstation level.

## 🔑 Customizing Patterns
To add proprietary secrets, edit `.sentry-schema.json`:
```json
"customPatterns": [
  {
    "name": "INTERNAL_UUID",
    "regex": "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
  }
]
```

---
**Standardized. Verified. Operational.**
