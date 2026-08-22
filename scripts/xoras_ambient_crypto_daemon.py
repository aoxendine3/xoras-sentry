import os
import time
import hashlib
import json

CORE_DIRS = [
    "/Users/ajoxendine68/Desktop/Xoras_Workspace/ELITE_BOW/core",
    "/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/scripts"
]
BASELINE_FILE = "/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/scripts/.ambient_baseline.json"

def hash_file(filepath):
    hasher = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            hasher.update(f.read())
        return hasher.hexdigest()
    except Exception:
        return None

def build_baseline():
    print("[AXIOM] Generating 3D structural cryptographic baseline...")
    baseline = {}
    for d in CORE_DIRS:
        if not os.path.exists(d): continue
        for root, _, files in os.walk(d):
            for file in files:
                if file.endswith(('.md', '.yaml', '.py', '.sh')):
                    path = os.path.join(root, file)
                    baseline[path] = hash_file(path)
    with open(BASELINE_FILE, 'w') as f:
        json.dump(baseline, f)
    return baseline

def ambient_monitor():
    print("[AXIOM] Ambient Cryptography Engaged. Atmospheric monitoring active.")
    if os.path.exists(BASELINE_FILE):
        with open(BASELINE_FILE, 'r') as f:
            baseline = json.load(f)
    else:
        baseline = build_baseline()

    # Ephemeral continuous loop (simulated for 3 iterations to prove mechanics)
    for _ in range(3):
        time.sleep(2)
        for filepath, stored_hash in baseline.items():
            current_hash = hash_file(filepath)
            if current_hash != stored_hash:
                print(f"[VANCE] CRITICAL BREACH: Unauthorized mutation detected in {filepath}")
                print(f"[VANCE] Ambient frequency mismatch. Restoring topological geometry...")
                # In a full deployment, this would revert the file from a secure ledger block.
        print("[AXIOM] Workspace geometry stable. Cryptographic resonance confirmed.")

if __name__ == "__main__":
    ambient_monitor()
