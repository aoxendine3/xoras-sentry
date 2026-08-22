"""
XORAS SYSTEMS - Autonomous Email Composer
Composes the grant application emails using the packet contents.
Requires Gmail App Password for autonomous send.
"""

grant_packet = open('/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/bounty_reports/XORAS_MASTER_SUBMISSION_PACKET.md', 'r').read()

emails = {
    "ai_grant": {
        "to": "apply@aigrant.org",
        "subject": "Grant Application: SOVRA.NEXUS — Sovereign Enterprise AI Node (Xoras Systems)",
        "from": "avant.apex@gmail.com",
        "body": f"""Dear AI Grant Review Team,

We are submitting the following application for the AI Open Source Grant on behalf of Xoras Systems, founded by Anthony J. Oxendine.

SOVRA.NEXUS is the industry's first completely self-contained, biomimetic sovereign enterprise AI node, already deployed to production. We are not seeking development capital. We are seeking scaling capital and H100 compute credits to red-team our architecture and launch our public testnet.

The full technical packet is attached below.

---

{grant_packet}

---

Contact: avant.apex@gmail.com
Founder: Anthony J. Oxendine, Xoras Systems

Sincerely,
The Xoras Collective
"""
    }
}

# Write the composed emails to disk for review before send
import os, json
out_dir = '/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/bounty_reports/'
for name, email in emails.items():
    out_path = os.path.join(out_dir, f'COMPOSED_EMAIL_{name.upper()}.md')
    with open(out_path, 'w') as f:
        f.write(f"# COMPOSED EMAIL: {name.upper()}\n")
        f.write(f"**FROM:** {email['from']}\n")
        f.write(f"**TO:** {email['to']}\n")
        f.write(f"**SUBJECT:** {email['subject']}\n\n---\n\n")
        f.write(email['body'])
    print(f"Email composed: {out_path}")

print("\nREADY FOR SEND.")
print("NOTE: To fully autonomous-send, we need a Gmail App Password.")
print("If you provide the App Password for avant.apex@gmail.com, we will transmit immediately.")
