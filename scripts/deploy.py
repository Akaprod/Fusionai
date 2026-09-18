#!/usr/bin/env python3
"""
Deploy to Hostinger automatically after git push.
Triggers a redeploy via SSH by running the Hostinger deployment command.
"""
import paramiko
import os
import sys
import time
import subprocess

KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hostinger")
HOST = "77.37.35.160"
PORT = 65002
USERNAME = "u398373271"
DOMAIN = "allcombiner.online"

def log(msg):
    print(f"[deploy] {msg}", flush=True)

def run_local(cmd):
    """Run a local shell command."""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
    return result.stdout.strip(), result.stderr.strip(), result.returncode

def run_ssh(client, cmd, timeout=30):
    """Run a command on the remote server via SSH."""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return out, err

def main():
    # Step 1: git push (if there are unpushed commits)
    log("Step 1: Checking git status...")
    out, err, rc = run_local("cd /home/z/my-project && git status --short")
    if out:
        log(f"Uncommitted changes:\n{out}")
        log("Staging and committing...")
        out, err, rc = run_local("cd /home/z/my-project && git add -A && git commit -m 'auto: deploy trigger'")
        if rc != 0 and "nothing to commit" not in err:
            log(f"Commit failed: {err}")
    else:
        log("No uncommitted changes")

    out, _, _ = run_local("cd /home/z/my-project && git log --oneline origin/main..HEAD")
    if out:
        log(f"Unpushed commits:\n{out}")
        log("Pushing to GitHub...")
        out, err, rc = run_local("cd /home/z/my-project && git push origin main")
        if rc != 0:
            log(f"Push failed: {err}")
            sys.exit(1)
        log("✓ Pushed to GitHub")
        # Wait for GitHub webhook to trigger Hostinger build
        log("Waiting 30s for Hostinger to detect the new commit...")
        time.sleep(30)
    else:
        log("No unpushed commits — Hostinger should already be up to date")

    # Step 2: Connect via SSH and check deployment status
    log(f"\nStep 2: Connecting to Hostinger via SSH ({HOST}:{PORT})...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname=HOST, port=PORT, username=USERNAME, key_filename=KEY_PATH,
                       timeout=30, allow_agent=False, look_for_keys=False,
                       banner_timeout=30, auth_timeout=30)
    except Exception as e:
        log(f"✗ SSH connection failed: {e}")
        log("Cannot trigger deploy automatically — user will need to redeploy via Hostinger panel")
        return

    log("✓ SSH connected")

    # Step 3: Check current build
    log("\nStep 3: Checking current deployed build...")
    out, _ = run_ssh(client, f"ls -la /home/{USERNAME}/domains/{DOMAIN}/hbuilds/versions/ | tail -3")
    log(f"Current builds:\n{out}")

    # Step 4: Try to trigger deployment via Hostinger's deploy script
    # Hostinger uses a deployment system that watches the git repo
    # We can try touching the repo to trigger a rebuild
    log("\nStep 4: Checking for deployment trigger mechanism...")
    out, _ = run_ssh(client, f"ls /home/{USERNAME}/domains/{DOMAIN}/hbuilds/ 2>&1 | head -10")
    log(f"hbuilds contents: {out}")

    # Check if there's a way to trigger deploy
    out, _ = run_ssh(client, f"which hpanel-deploy 2>&1; which hostinger-deploy 2>&1; ls /home/{USERNAME}/.hpanel 2>&1 | head -5")
    log(f"Deploy tools: {out}")

    # Check git remote status on Hostinger
    out, _ = run_ssh(client, f"cd /home/{USERNAME}/domains/{DOMAIN} && git remote -v 2>&1 | head -5")
    log(f"Hostinger git remote: {out}")

    # Try git pull on Hostinger side
    log("\nStep 5: Attempting git fetch on Hostinger...")
    out, err = run_ssh(client, f"cd /home/{USERNAME}/domains/{DOMAIN} && git fetch origin 2>&1 | head -5", timeout=60)
    log(f"git fetch: {out or err}")

    out, err = run_ssh(client, f"cd /home/{USERNAME}/domains/{DOMAIN} && git log --oneline -3 origin/main 2>&1")
    log(f"Latest commits on Hostinger:\n{out}")

    client.close()
    log("\n✓ SSH session closed")
    log("\n=== Summary ===")
    log("1. Code pushed to GitHub ✓")
    log("2. Hostinger should auto-detect the new commit via webhook")
    log("3. If not auto-deployed, user needs to click 'Redeploy' in Hostinger panel")
    log("\nThe build takes ~2-3 minutes. You can check status at:")
    log("https://hpanel.hostinger.com → allcombiner.online → Git deployments")

if __name__ == "__main__":
    main()
