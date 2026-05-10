# XORAS Sentry // Institutional Inventory

This document serves as the formal inventory of the XORAS Sentry ecosystem as of the v1.2.2 Institutional Release.

## 1. Canonical Infrastructure
*   **Domain**: `xoras.com` (Target: Cloudflare Edge)
*   **Nameservers**: `bryce.ns.cloudflare.com`, `gabriella.ns.cloudflare.com`
*   **Security**: DNSSEC Active (Pending DS Record verification)
*   **Hosting**: Cloudflare Pages (Continuous Deployment from GitHub)

## 2. Monorepo Architecture (`packages/*` & `apps/*`)
*   **apps/web**: Next.js 15 Application (The XORAS Hub)
*   **packages/api**: tRPC v11 Router (Secure Handshake)
*   **packages/core**: AST Auditing Logic (Sentry Core)
*   **packages/db**: Drizzle ORM + Neon PostgreSQL Schema
*   **packages/ui**: Shared Tailwind Component Library

## 3. Technology Stack (2026 Standard)
*   **Runtime**: Next.js Edge Runtime / Node.js 24.x
*   **Frontend**: React 19 / Tailwind 4.0 / shadcn/ui
*   **Backend**: tRPC / Zod / jose (JWT)
*   **Persistence**: Drizzle / Neon (HTTP Serverless)
*   **Defense**: Upstash Redis (Global Rate Limiting)

## 4. Operational Assets
*   **Core Sentry CLI**: `npx xoras-sentry`
*   **Vanguard C# Scripts**: Hardened Unity/C# integrations for game-state security.
*   **Stripe Integration**: Verifiable revenue/entitlement handshake.
*   **Institutional Dashboard**: High-fidelity operational status monitor.

## 5. Security Perimeter
*   **Auth**: JWT-based identity with Edge Middleware verification.
*   **Rate Limiting**: Sliding window protection at the global Edge level.
*   **Data Integrity**: AST-powered secret scanning with 0% cloud leakage.
*   **License**: BSL-1.1 (Institutional Standard)

---
**Status**: NOMINAL // Awaiting Final Nameserver Propagation.
