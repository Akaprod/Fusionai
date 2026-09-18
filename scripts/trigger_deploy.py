#!/usr/bin/env python3
"""
Trigger Hostinger deploy via SSH with retries.
Hostinger watches the git repo for changes — we just need to touch it.
"""
import paramiko
import os
import time
import socket

KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hostinger")
HOST = "77.37.35.160"
PORT = 65002
USERNAME = "u398373271"

# Force IPv4
original_getaddrinfo = socket.getaddrinfo
def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = ipv4_getaddrinfo

print(f"[deploy] Attempting SSH to {HOST}:{PORT} (max 5 retries)...")

for attempt in range(1, 6):
    print(f"\n[deploy] Attempt {attempt}/5...", flush=True)
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=HOST,
            port=PORT,
            username=USERNAME,
            key_filename=KEY_PATH,
            timeout=60,
            allow_agent=False,
            look_for_keys=False,
            banner_timeout=60,
            auth_timeout=60,
        )
        print("✓ SSH connected!")

        # Run a simple command to verify
        stdin, stdout, stderr = client.exec_command("whoami && date", timeout=15)
        out = stdout.read().decode().strip()
        print(f"  Server: {out}")

        # Check git status on Hostinger
        stdin, stdout, stderr = client.exec_command(
            f"cd /home/{USERNAME}/domains/allcombiner.online && git log --oneline -3 origin/main 2>&1",
            timeout=30,
        )
        out = stdout.read().decode().strip()
        print(f"\n[deploy] Latest commits on Hostinger repo:\n{out}")

        # Try to fetch latest
        stdin, stdout, stderr = client.exec_command(
            f"cd /home/{USERNAME}/domains/allcombiner.online && git fetch origin 2>&1 && git log --oneline -3 origin/main 2>&1",
            timeout=60,
        )
        out = stdout.read().decode().strip()
        print(f"\n[deploy] After git fetch:\n{out}")

        client.close()
        print("\n✓ SSH session successful — Hostinger should auto-deploy from latest commit")
        break
    except Exception as e:
        print(f"✗ Attempt {attempt} failed: {e}")
        if attempt < 5:
            print("Waiting 10s before retry...")
            time.sleep(10)
else:
    print("\n✗ All SSH attempts failed")
    print("The code IS pushed to GitHub, but Hostinger's webhook may not be configured.")
    print("User needs to click 'Redeploy' in Hostinger panel manually.")
