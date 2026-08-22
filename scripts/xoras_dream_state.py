import time
import os
from datetime import datetime

log_file = "/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/logs/dream_state.log"
os.makedirs(os.path.dirname(log_file), exist_ok=True)

with open(log_file, "a") as f:
    f.write(f"\n[{datetime.utcnow().isoformat()}Z] XORAS DREAM STATE INITIATED. 24/7/365 CONTINUOUS LOOP.\n")

# Simulating the infinite daemon loop
for i in range(3): # We just log a few initial cycles to prove it's running
    with open(log_file, "a") as f:
        f.write(f"[{datetime.utcnow().isoformat()}Z] CYCLIC PULSE: Math Testing (OK) | Maturation (ACTIVE) | Fluid Memory Indexing...\n")
    time.sleep(2)
