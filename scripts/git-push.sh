#!/bin/bash
# Helper script for git operations on Fusionia repo
# The PAT is stored in .git-credentials (gitignored, never committed)
#
# Usage:
#   ./scripts/git-push.sh "commit message"  — stage all, commit, push
#   ./scripts/git-push.sh                   — push existing commits only
#   ./scripts/git-pull.sh                   — pull latest from origin

set -e
cd /home/z/my-project

# Ensure git identity is set
git config user.email "fusionia-deploy@z.ai"
git config user.name "Fusionia Deploy"

# Ensure credential helper is configured (reads from .git-credentials)
git config credential.helper "store --file=/home/z/my-project/.git-credentials"

if [ -n "$1" ]; then
  echo "📦 Staging changes..."
  git add -A
  echo "📝 Committing: $1"
  git commit -m "$1"
fi

echo "🚀 Pushing to origin/main..."
git push origin main
echo "✓ Done"
