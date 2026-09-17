#!/usr/bin/env python3
"""Search for a public Z.AI API endpoint reachable from Hostinger."""
import paramiko
import os

KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hostinger")
HOST = "srv657.main-hosting.eu"
PORT = 65002
USERNAME = "u398373271"

import socket
# Force IPv4 resolution
original_getaddrinfo = socket.getaddrinfo
def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = ipv4_getaddrinfo

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname="77.37.35.160", port=PORT, username=USERNAME, key_filename=KEY_PATH, timeout=30, allow_agent=False, look_for_keys=False, banner_timeout=30, auth_timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=20)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return out, err

# Test all possible public Z.AI endpoints from Hostinger
candidates = [
    "https://api.z.ai/v1/images/generations/edit",
    "https://api.z.ai/api/v1/images/generations/edit",
    "https://chat.z.ai/api/v1/images/generations/edit",
    "https://chat.z.ai/v1/images/generations/edit",
    "https://open.bigmodel.cn/api/paas/v4/images/generations",
    "https://open.bigmodel.cn/api/paas/v4/images/generations/edit",
    "https://chatglm.cn/api/paas/v4/images/generations/edit",
    "https://z.ai/api/v1/images/generations/edit",
    "https://api.chatglm.cn/api/paas/v4/images/generations/edit",
    "https://api.z.ai/v1/chat/completions",  # Different endpoint to test auth
    "https://chat.z.ai/api/v1/chat/completions",
]

print("=== Testing Z.AI public endpoints from Hostinger ===\n")
for url in candidates:
    cmd = f"curl -s --max-time 10 -o /dev/null -w '%{{http_code}} %{{time_total}}s' -X POST '{url}' -H 'Content-Type: application/json' -H 'Authorization: Bearer Z.ai' -d '{{\"prompt\":\"test\"}}' 2>&1"
    out, err = run(cmd)
    status = out if out else err
    # Check if not 405 (wrong method) and not 000 (unreachable)
    marker = "✓" if (out and out.startswith("4") and not out.startswith("405")) else ("✗" if (out == "000" or out.startswith("000")) else "?")
    print(f"{marker} {url} → {status[:50]}")

print("\n=== Testing GET endpoints (different methods) ===\n")
for url in ["https://api.z.ai", "https://chat.z.ai", "https://chatglm.cn", "https://open.bigmodel.cn"]:
    cmd = f"curl -s --max-time 10 -o /dev/null -w '%{{http_code}} %{{time_total}}s' '{url}' 2>&1"
    out, err = run(cmd)
    print(f"{url} → {out or err}")

client.close()
print("\n✓ Done")
