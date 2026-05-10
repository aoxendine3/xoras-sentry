# XORAS // INSTITUTIONAL API [v1.2.2]

### High-Fidelity tRPC Handshake Layer
*Type-safe. Secure. Institutional.*

`@xoras/api` provides the verifiably robust communication layer for the XORAS Sentry ecosystem. Built on **tRPC v11**, it ensures end-to-end type safety between the auditing core and the institutional dashboard, eliminating the API boundary and preventing structural configuration drift.

---

## 🚀 Quickstart

### 1. Root Router
The root router is defined in `src/root.ts` and merges sub-routers for auditing, billing, and system metrics.

### 2. Client Handshake
Consumer clients in `apps/web` utilize the exported `AppRouter` type to achieve 100/1 type integrity.

---

## 🛡️ Security Features
- **Zero-Trust Middleware**: Enforces institutional credential checks on every protected procedure.
- **Zod Enforcement**: Every input is strictly validated against the structural schema.
- **Edge-Optimized**: Designed for sub-10ms execution within the Cloudflare Edge runtime.
- **SuperJSON Serialization**: Preserves rich types (Dates, Sets, Maps) across the wire.

---

## 🛠️ Procedure Reference

| Router | Procedure | Type | Description |
| :--- | :--- | :--- | :--- |
| `audit` | `getStats` | Query | Public real-time metrics for `xoras.com`. |
| `audit` | `generateManifest` | Mutation | Signed integrity manifest generation. |

---
**Standardized. Verified. Operational.**
*XORAS API — The type-safe backbone of institutional security.*
