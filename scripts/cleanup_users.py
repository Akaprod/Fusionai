#!/usr/bin/env python3
"""Delete test user and clean up via SSH."""
import paramiko
import os
import socket

# Force IPv4
original_getaddrinfo = socket.getaddrinfo
def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = ipv4_getaddrinfo

KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_fusionia")
HOST = "77.37.35.160"
PORT = 65002
USERNAME = "u398373271"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

for attempt in range(1, 4):
    try:
        client.connect(
            hostname=HOST, port=PORT, username=USERNAME,
            key_filename=KEY_PATH, timeout=30,
            allow_agent=False, look_for_keys=False,
            banner_timeout=30, auth_timeout=30,
        )
        print(f"✓ SSH connected (attempt {attempt})")
        break
    except Exception as e:
        print(f"Attempt {attempt} failed: {e}")
        if attempt < 3:
            import time; time.sleep(5)
        else:
            print("✗ Cannot connect via SSH")
            exit(1)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    return stdout.read().decode().strip(), stderr.read().decode().strip()

# Find the test user
print("\n=== Find test user ===")
out, _ = run("mysql -u u398373271_fusionai -p'Locmane@2027' u398373271_fusionai -e \"SELECT id, email, name, role FROM User;\" 2>/dev/null")
print(out)

# Delete test user if exists
print("\n=== Delete test user ===")
out, _ = run("mysql -u u398373271_fusionai -p'Locmane@2027' u398373271_fusionai -e \"DELETE FROM User WHERE email='test@test.com';\" 2>/dev/null")
print("Deleted test@test.com" if not _ else f"Error: {_}")

# Verify
print("\n=== Verify users after delete ===")
out, _ = run("mysql -u u398373271_fusionai -p'Locmane@2027' u398373271_fusionai -e \"SELECT id, email, name, role, credits FROM User;\" 2>/dev/null")
print(out)

client.close()
print("\n✓ Done")
