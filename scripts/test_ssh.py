#!/usr/bin/env python3
"""Test SSH connection to Hostinger."""
import paramiko
import os

KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hostinger")

# Try common Hostinger SSH connection patterns
HOSTS_TO_TRY = [
    ("srv657.main-hosting.eu", 65002),
    ("srv657.hstgr.io", 65002),
    ("31.220.31.247", 65002),  # Hostinger often uses this IP range
    ("srv657.main-hosting.eu", 22),
    ("srv657.hstgr.io", 22),
]

USERNAME = "u398373271"

print(f"Using SSH key: {KEY_PATH}")
print(f"Exists: {os.path.exists(KEY_PATH)}")
print()

for host, port in HOSTS_TO_TRY:
    print(f"Trying {USERNAME}@{host}:{port}...", end=" ", flush=True)
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=host,
            port=port,
            username=USERNAME,
            key_filename=KEY_PATH,
            timeout=10,
            allow_agent=False,
            look_for_keys=False,
        )
        print("✓ CONNECTED!")
        # Run a simple command to verify
        stdin, stdout, stderr = client.exec_command("whoami && pwd && hostname")
        output = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        print(f"  whoami/pwd/hostname: {output}")
        if err:
            print(f"  stderr: {err}")
        client.close()
        print(f"\n✓ Working SSH config: {USERNAME}@{host}:{port}")
        # Save for later use
        with open("/tmp/ssh_config.txt", "w") as f:
            f.write(f"{host}:{port}:{USERNAME}:{KEY_PATH}")
        break
    except Exception as e:
        msg = str(e)[:80]
        print(f"✗ {msg}")
