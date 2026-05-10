# XORAS // INSTITUTIONAL DATABASE [v1.2.2]

### Edge-Optimized Persistence Layer
*Type-safe. Serverless. Hardened.*

`@xoras/db` provides the high-performance persistence layer for the XORAS Sentry ecosystem. Built on **Drizzle ORM** and optimized for the **Neon PostgreSQL** serverless driver, it ensures sub-10ms query execution within global Edge runtimes.

---

## 🚀 Quickstart

### 1. Schema Definition
The ground-truth schema is defined in `src/schema.ts` using Drizzle's type-safe DSL.

### 2. Edge Connection
The database client in `src/index.ts` automatically switches between HTTP (stateless) and WebSocket (transactional) modes based on the execution context.

---

## 🛡️ Integrity Features
- **Structural Schemas**: Every table is defined with strict PostgreSQL constraints and TypeScript inference.
- **AST Metrics Storage**: Optimized for storing and querying deep Abstract Syntax Tree auditing data.
- **Idempotency Ledger**: Built-in support for Stripe event de-duplication and revenue guarding.
- **Neon Branching**: Seamlessly integrates with Neon's instant copy-on-write branching for preview deployments.

---

## 🛠️ Schema Reference

| Table | Description | Key Fields |
| :--- | :--- | :--- |
| `audit_logs` | Verifiable history of security audits. | `id`, `entityName`, `status`, `metrics` |

---
**Standardized. Verified. Operational.**
*XORAS DB — The high-performance foundation of institutional integrity.*
