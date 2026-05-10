# XORAS Sentry // Planned Architecture and Current State

This document outlines the current operational state and planned architectural baseline of the XORAS Sentry ecosystem as of v1.2.2.

## 1. Infrastructure Baseline
*   **Domain**: `xoras.com` **[STAGED]** - Nameservers `bryce.ns.cloudflare.com` / `gabriella.ns.cloudflare.com` pending registrar propagation.
*   **DNSSEC**: **[STAGED]** - Records configured in Cloudflare; awaiting chain-of-trust verification.
*   **Hosting**: **[STAGED]** - Cloudflare Pages deployment ready; awaiting DNS finality.

## 2. Monorepo Architecture (Current State on Disk)
*   **apps/web**: **[VERIFIED]** - Next.js 15 + Tailwind 4.0 skeleton initialized and sandbox-tested.
*   **packages/api**: **[VERIFIED]** - tRPC v11 Router verified via sandbox integration.
*   **packages/db**: **[VERIFIED]** - Drizzle ORM schema verified via sandbox metadata check.
*   **packages/core**: **[VERIFIED]** - AST Auditing Engine with active test suite.
*   **packages/integrations/payments**: **[VERIFIED]** - `stripe.cjs` signature and ledger verified.

## 3. Technology Stack (Implementation Status)
*   **Runtime**: Next.js Edge Runtime / Node.js 24.x **[VERIFIED]**
*   **Frontend**: React 19 / Tailwind 4.0 / shadcn/ui **[VERIFIED]**
*   **Backend**: tRPC / Zod / jose (JWT) **[VERIFIED]**
*   **Persistence**: Drizzle / Neon (HTTP Serverless) **[VERIFIED]** - Schema and drivers sandbox-tested.
*   **Defense**: Upstash Redis (Rate Limiting) **[VERIFIED]** - Middleware logic verified via sandbox.

## 4. Operational Assets
*   **Core Sentry CLI**: `npx xoras-sentry` **[VERIFIED]**
*   **Vanguard C# Scripts**: Hardened Unity/C# scripts verified via sandbox security sweep. **[VERIFIED]**
*   **Institutional Dashboard**: High-fidelity UI port verified via structural assets check. **[VERIFIED]**

## 5. Security Perimeter
*   **Auth**: JWT verification in Edge Middleware. **[VERIFIED]**
*   **Rate Limiting**: Sliding window middleware verified. **[VERIFIED]**
*   **License**: BSL-1.1 Institutional Standard. **[VERIFIED]**

---
**Current Operational Status**: INFRASTRUCTURE PENDING // CODEBASE NOMINAL
