name: XORAS SENTRY Security Audit

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main ]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Run XORAS SENTRY Audit
        run: |
          npm install -g integrity-sentry-core
          xoras-sentry . --delta --json > audit-results.json
          
      - name: Upload Audit Report
        uses: actions/upload-artifact@v4
        with:
          name: xoras-sentry-report
          path: audit-results.json
