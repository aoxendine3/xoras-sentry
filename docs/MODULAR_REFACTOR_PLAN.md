# XORAS SENTRY // MODULAR REFACTOR PLAN

## 1. Objectives
- **Decoupling**: Separate the scanning engine from the interface and visualization layers.
- **Package Proliferation**: Increase reach by publishing multiple specialized packages.
- **Commercial Alignment**: Map Gumroad tiers directly to independent software modules.

## 2. New Architecture (Monorepo)
```text
integrity-sentry-core/
├── packages/
│   ├── core/           # [xoras-sentry] The engine. Pure scanner lib.
│   │   ├── src/        # Refactored lib/core
│   │   └── package.json
│   ├── cli/            # [xoras-sentry-cli] The interface.
│   │   ├── bin/        # Refactored bin/
│   │   └── package.json (Depends on core)
│   ├── integrations/   # specialized hooks and actions
│   │   ├── action/     # [xoras-sentry-action]
│   │   └── hook/       # [xoras-sentry-hook]
│   └── ui/             # [xoras-sentry-ui] The visualization layer.
│       ├── src/        # Refactored reporter.cjs
│       └── package.json (Takes JSON input)
└── package.json (Workspaces root)
```

## 3. Implementation Phases

### Phase 1: Core Extraction (`xoras-sentry`)
- Move `lib/core/scanner.cjs`, `lib/core/policy.cjs`, `lib/core/tracer.cjs`, and `lib/core/malware.cjs` to `packages/core/`.
- Ensure **Zero CLI Dependencies**. The core should only take a path/config and return a findings object.
- **Commercial Tier**: Free / Open Source.

### Phase 2: CLI Wrapper (`xoras-sentry-cli`)
- Move `bin/env-integrity-sentry.cjs` logic to `packages/cli/`.
- Refactor to consume `xoras-sentry` as a dependency.
- Handle all argument parsing, terminal colors, and file writing here.
- **Commercial Tier**: Indie Bundle.

### Phase 3: Dashboard Decoupling (`xoras-sentry-ui`)
- Move `lib/core/reporter.cjs` to `packages/ui/`.
- Refactor the reporter to be a standalone renderer that accepts the scanner's JSON output.
- **Commercial Tier**: Team Pro.

### Phase 4: Integrations Setup
- Move `scripts/install-hook.cjs` and `GHA_WORKFLOW.md` into `packages/integrations/`.
- Package them as independently installable utilities.
- **Commercial Tier**: Indie Bundle / Team Pro.

## 4. Business Benefits
- **Metric Compounding**: 4x the potential npm download metrics.
- **Focused Maintenance**: Bug fixes in the UI don't require a CLI release.
- **Market Positioning**: Positions XORAS as an extensible security platform rather than just a script.

---
**Standardized. Verified. Operational.**
