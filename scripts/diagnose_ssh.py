#!/usr/bin/env python3
"""Diagnose Z.AI API connectivity from Hostinger server."""
import paramiko
import os

KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hostinger")
HOST = "srv657.main-hosting.eu"
PORT = 65002
USERNAME = "u398373271"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(
    hostname=HOST,
    port=PORT,
    username=USERNAME,
    key_filename=KEY_PATH,
    timeout=15,
    allow_agent=False,
    look_for_keys=False,
)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return out, err

print("=" * 60)
print("=== Test 1: DNS resolution of internal-api.z.ai ===")
out, err = run("getent hosts internal-api.z.ai 2>&1 || host internal-api.z.ai 2>&1 || nslookup internal-api.z.ai 2>&1")
print(out or err)

print("\n=== Test 2: Test HTTPS connectivity to internal-api.z.ai ===")
out, err = run("curl -s --max-time 10 -o /dev/null -w 'HTTP %{http_code} time: %{time_total}s\\n' https://internal-api.z.ai/v1 2>&1")
print(out or err)

print("\n=== Test 3: Test POST to internal-api.z.ai/v1/images/generations/edit ===")
out, err = run("curl -s --max-time 10 -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer Z.ai' -d '{\"prompt\":\"test\"}' https://internal-api.z.ai/v1/images/generations/edit 2>&1 | head -c 500")
print(out[:500] if out else err[:500])

print("\n=== Test 4: Test chatglm.cn POST ===")
out, err = run("curl -s --max-time 10 -X POST -H 'Content-Type: application/json' -d '{}' https://chatglm.cn/api/v1/images/generations/edit 2>&1 | head -c 300")
print(out[:300] if out else err[:300])

print("\n=== Test 5: Check if .z-ai-config exists in hbuild ===")
out, err = run("find /home/u398373271/domains/allcombiner.online -name '.z-ai-config' -type f 2>/dev/null | head -5")
print(out or "(none found)")

print("\n=== Test 6: Check current build version ===")
out, err = run("ls -la /home/u398373271/domains/allcombiner.online/hbuilds/versions/ 2>&1 | head -10")
print(out)

print("\n=== Test 7: Check if .env vars are visible to node process ===")
out, err = run("ls -la /home/u398373271/domains/allcombiner.online/hbuilds/versions/ 2>&1 | tail -3")
print(out)

client.close()
print("\n✓ Done")
