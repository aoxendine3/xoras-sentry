# XORAS SENTRY // Marketing Assets

---

## 🐦 Twitter/X Posts

### Post 1: Technical (AST Scanning)
"Regex is not enough for modern security. XORAS SENTRY uses full AST resolution to detect secrets even inside member expressions and dynamic template literals. Precision auditing, zero false negatives. 🛡️ #AppSec #NodeJS #CyberSecurity"

### Post 2: Social Proof (Benchmarks)
"Benchmarks are in: XORAS SENTRY delivers 6x faster scanning on mid-size repositories compared to standard AST walking, without sacrificing structural fidelity. Lightweight. Local-first. Fast. 🚀 #DevSecOps #OpenSource"

### Post 3: Problem-Led (The Cost of Leaks)
"A single leaked Stripe or AWS key in your source code can cost $10k+ in minutes. Don't wait for the bill. Run xoras-sentry locally to block leaks before they reach production. 🛑 #IndieHackers #SaaS #Security"

---

## 😸 Product Hunt Launch

**Tagline:** High-precision, local-first secret scanning for modern developers.

**Description:**
XORAS SENTRY is a lightweight CLI tool built to identify hardcoded secrets with AST-level accuracy. Unlike cloud-heavy scanners, Sentry runs 100% locally, requiring no data uploads or external accounts. Optimized for speed and precision, it's the security layer every indie developer needs.

**First Comment:**
"Hey everyone! I built XORAS SENTRY because I was tired of scanners that either required my source code in their cloud or were too slow to run on every commit. Sentry is built on the Acorn AST framework, ensuring it catches secrets that simple regex tools miss, all while maintaining a zero-footprint local-first architecture. I'd love to hear your feedback!"

---

## 📝 Blog Post Outline: "Why I built a local-first secret scanner"
1. **The 'Cloud Tax' of Security**: Why small teams avoid enterprise scanners.
2. **The Regex Trap**: Why simple string matching fails in modern JS/TS.
3. **Building on Acorn**: How AST-level resolution works.
4. **Fast-Path Optimization**: Scaling the scanner for 100k+ file repos.
5. **The Autonomy Standard**: Why local-first is the future of dev tools.

---

## 🤖 Reddit Strategy
- **r/node**: Focus on the AST implementation and performance.
- **r/javascript**: Share the "Fast-Path" regex/AST hybrid approach.
- **r/indiehackers**: Highlight the $49 one-time cost vs. monthly SaaS fees.
- **r/cybersecurity**: Discuss the privacy benefits of air-gapped scanning.
- **r/devops**: Focus on the GHA workflow and pre-commit hook integration.

---

## 📊 Phase 4: Performance Audit Baselines

| Metric | "Good" Baseline | Measurement Mechanism |
| :--- | :--- | :--- |
| **npm Downloads** | > 500 in 30 days | npm registry stats |
| **Gumroad Conv.** | > 2% | Gumroad dashboard analytics |
| **Star Velocity** | > 10 stars/week | GitHub insights |
| **False Positives** | < 0.5% | User-reported GitHub issues vs. download volume |
