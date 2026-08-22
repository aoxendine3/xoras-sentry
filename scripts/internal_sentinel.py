import os
import re

TARGET_DIRS = [
    "/Users/ajoxendine68/Desktop/Xoras_Workspace/workspaces/incubation/new-builds/programmatic_seo_engine",
    "/Users/ajoxendine68/Desktop/Xoras_Workspace/workspaces/incubation/new-builds/anima_animus_engine"
]

print("[MAXX] Initializing Internal Sentinel Hunt...")
print("[MAXX] Targeting legacy Vercel/Cloudflare incubation builds from Q1...")

found_issues = []

for d in TARGET_DIRS:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        if 'node_modules' in root or '.next' in root: continue
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Find unhandled hydration errors or Vercel build blockers
                        if 'window !== "undefined"' in content:
                            found_issues.append((path, "Hydration Error Risk: window object accessed before mount"))
                        if 'FIXME:' in content or 'TODO:' in content:
                            found_issues.append((path, "Unresolved legacy FIXME/TODO blocking production compilation"))
                        if 'process.env.' in content and not 'NEXT_PUBLIC_' in content:
                            found_issues.append((path, "Vercel Build Blocker: Server-side env var exposed to client bundle"))
                except Exception:
                    pass

print(f"\n[VANCE] Hunt Complete. Intercepted {len(found_issues)} legacy structural errors.")
if found_issues:
    print("[MAXX] Extracting telemetry to Hunt Report for immediate remediation.")
    with open('/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/hunt_report.md', 'w') as f:
        f.write("# 🎯 INTERNAL SENTINEL: HUNT REPORT\n")
        f.write("**Status:** Legacy Errors Identified. Ready for Remediation.\n\n")
        for path, issue in found_issues[:10]:
            f.write(f"- **File:** `{os.path.basename(path)}`\n  - **Issue:** {issue}\n")
else:
    print("[MAXX] No critical legacy build blockers found in the fast-scan. Deep AST required.")
    with open('/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/hunt_report.md', 'w') as f:
        f.write("# 🎯 INTERNAL SENTINEL: HUNT REPORT\n")
        f.write("Fast-scan did not hit the specific February errors. Moving to Deep AST parsing on the Vercel deployments.\n")
