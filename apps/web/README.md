# XORAS // INSTITUTIONAL HUB [v1.2.2]

### High-Fidelity Next.js 15 Dashboard
*Performant. Secure. Institutional.*

`apps/web` is the primary interface for the XORAS Sentry ecosystem. Built on **Next.js 15** and **React 19**, it provides a real-time monitor for auditing metrics, manifest generation, and institutional security management.

---

## 🚀 Quickstart

### 1. Local Development
```bash
npm run dev
```

### 2. Edge Preview
The application is optimized for the **Cloudflare Edge Runtime**. Export the `edge` runtime in your routes to achieve sub-50ms latency.

---

## 🛡️ Frontend Security
- **Edge Middleware**: JWT-based auth and rate limiting enforced at the Point of Presence (PoP).
- **Tailwind 4.0**: Premium, utility-first styling for high-trust institutional aesthetics.
- **Server Actions**: Leveraging React 19 for secure, type-safe data mutations.
- **Content Security Policy**: Hardened CSP headers injected via middleware.

---

## 🛠️ Page Reference

| Route | Description | Runtime |
| :--- | :--- | :--- |
| `/` | Institutional Landing Page & Hero Metrics. | Edge |
| `/dashboard` | Real-time Sentry audit stream. | Edge |
| `/login` | Secure institutional credential gateway. | Node.js |

---
**Standardized. Verified. Operational.**
*XORAS HUB — The face of sovereign security.*
