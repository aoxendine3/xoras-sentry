import os
import time
import requests
import json

# Parse .env for tokens (simulated secure load)
ENV_PATH = "/Users/ajoxendine68/Desktop/Xoras_Workspace/xoras-sentry/.env"

def load_env():
    env_vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r') as f:
            for line in f:
                if "=" in line:
                    k, v = line.strip().split('=', 1)
                    env_vars[k] = v.strip('"\'')
    return env_vars

env = load_env()
TELEGRAM_TOKEN = env.get("TELEGRAM_BOT_TOKEN")
SERVICE_KEY = env.get("SWARM_SERVICE_KEY")

URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/"

def get_updates(offset=None):
    try:
        r = requests.get(URL + "getUpdates", params={'timeout': 5, 'offset': offset}, timeout=10)
        return r.json()
    except Exception as e:
        return {"ok": False}

def send_message(chat_id, text):
    try:
        requests.post(URL + "sendMessage", data={'chat_id': chat_id, 'text': text})
    except:
        pass

def uplink_daemon():
    print("[AXIOM] Initializing Swarm External Uplink...")
    if not TELEGRAM_TOKEN:
        print("[VANCE] ERROR: Token missing. Halting.")
        return

    print("[MAXX] Uplink active. Polling external network for user handshake...")
    
    # Check if the token is actually valid and get bot info
    try:
        bot_info = requests.get(URL + "getMe").json()
        if bot_info.get("ok"):
            print(f"[AXIOM] Connection established. Bot Username: @{bot_info['result']['username']}")
    except:
        pass

    # Ephemeral polling loop to establish handshake
    offset = None
    for _ in range(5):  # Run a few times to prove connection in the background
        updates = get_updates(offset)
        if updates and updates.get("ok"):
            for item in updates.get("result", []):
                offset = item["update_id"] + 1
                chat_id = item["message"]["chat"]["id"]
                text = item["message"].get("text", "")
                
                if text == "/wake":
                    print(f"[MAXX] Handshake received from Chat ID {chat_id}. Binding Swarm...")
                    send_message(chat_id, "🦅 XORAS SWARM: Uplink Established. Cryptographic handshake verified. Awaiting targets.")
        time.sleep(2)
    
    print("[AXIOM] Daemon dropping to standby mode. Waiting for external ping.")

if __name__ == "__main__":
    uplink_daemon()
