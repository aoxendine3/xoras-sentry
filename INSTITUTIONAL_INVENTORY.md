# XORAS Sentry // Planned Architecture and Current State

This document outlines the current operational state and planned architectural baseline of the XORAS Sentry ecosystem as of v1.2.2.

## 1. Infrastructure Baseline
*   **Domain**: `xoras.com` **[STAGED]** - Nameservers `bryce.ns.cloudflare.com` / `gabriella.ns.cloudflare.com` pending registrar propagation.
*   **DNSSEC**: **[STAGED]** - Records configured in Cloudflare; awaiting chain-of-trust verification.
*   **Hosting**: **[STAGED]** - Cloudflare Pages deployment ready; awaiting DNS finality.

## 2. Monorepo Architecture (Current State on Disk)
*   **apps/web**: **[VERIFIED]** - Next.js 15 + Tailwind 4.0 skeleton initialized.
*   **packages/api**: **[VERIFIED]** - tRPC v11 Router and procedures defined (Refactored for Edge).
*   **packages/db**: **[VERIFIED]** - Drizzle ORM schema and Neon driver configuration initialized.
*   **packages/core**: **[VERIFIED]** - AST Auditing Engine with active test suite.
*   **packages/integrations/payments**: **[VERIFIED]** - `stripe.cjs` integration exists for entitlement verification.

## 3. Technology Stack (Implementation Status)
*   **Runtime**: Next.js Edge Runtime / Node.js 24.x **[VERIFIED]**
*   **Frontend**: React 19 / Tailwind 4.0 / shadcn/ui **[VERIFIED]**
*   **Backend**: tRPC / Zod / jose (JWT) **[VERIFIED]**
*   **Persistence**: Drizzle / Neon (HTTP Serverless) **[STAGED]** - Awaiting live Neon DB URL.
*   **Defense**: Upstash Redis (Rate Limiting) **[STAGED]** - Middleware configured; awaiting production keys.

## 4. Operational Assets
*   **Core Sentry CLI**: `npx xoras-sentry` **[VERIFIED]**
*   **Vanguard C# Scripts**: Hardened Unity/C# scripts for game-state security. **[VERIFIED]**
*   **Institutional Dashboard**: High-fidelity UI port in progress in `apps/web`. **[STAGED]**

## 5. Security Perimeter
*   **Auth**: JWT verification in Edge Middleware. **[VERIFIED]**
*   **Rate Limiting**: Sliding window middleware implemented. **[VERIFIED]**
*   **License**: BSL-1.1 Institutional Standard. **[VERIFIED]**

---
**Current Operational Status**: INFRASTRUCTURE PENDING // CODEBASE NOMINAL
