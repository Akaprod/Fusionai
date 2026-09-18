#!/usr/bin/env python3
"""Check Hostinger deployment status via SSH."""
import paramiko
import os

KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hostinger")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname="77.37.35.160", port=65002, username="u398373271", key_filename=KEY_PATH, timeout=30, allow_agent=False, look_for_keys=False, banner_timeout=30, auth_timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return out, err

print("=== Check current build ===")
out, _ = run("ls -la /home/u398373271/domains/allcombiner.online/hbuilds/versions/ 2>&1 | tail -5")
print(out)

print("\n=== Check if OPENROUTER_API_KEY is in env ===")
# Check the .env file used by the running app
out, _ = run("find /home/u398373271/domains/allcombiner.online -name '.env' -type f 2>/dev/null | head -5")
print(out)

print("\n=== Check merge route source deployed ===")
out, _ = run("find /home/u398373271/domains/allcombiner.online/hbuilds/versions -name 'route.js' -path '*merge*' 2>/dev/null | head -3")
print(out)
if out:
    first_file = out.split('\n')[0]
    print(f"\n=== grep OPENROUTER in {first_file} ===")
    out2, _ = run(f"grep -l 'OPENROUTER\\|openrouter' '{first_file}' 2>&1 | head -2")
    print(out2 or "NOT FOUND - old code still deployed")

print("\n=== Test OpenRouter reachability from Hostinger ===")
out, _ = run("curl -s --max-time 10 -o /dev/null -w 'HTTP %{http_code} time: %{time_total}s\\n' -X POST 'https://openrouter.ai/api/v1/images/generations' -H \"Authorization: Bearer $OPENROUTER_API_KEY\" -H 'Content-Type: application/json' -d '{\"model\":\"black-forest-labs/flux.2-klein-4b\",\"prompt\":\"test\",\"n\":1}' 2>&1 | head -c 500")
print(out[:500])

client.close()
print("\n✓ Done")
