#!/bin/bash
# Pull latest changes from GitHub
set -e
cd /home/z/my-project

git config credential.helper "store --file=/home/z/my-project/.git-credentials"

echo "⬇ Pulling from origin/main..."
git pull origin main
echo "✓ Done"
