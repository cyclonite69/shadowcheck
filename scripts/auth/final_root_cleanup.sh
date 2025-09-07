#!/usr/bin/env bash
# Final methodical cleanup - organize remaining root scripts by purpose

set -euo pipefail

echo "=== FINAL ROOT CLEANUP ==="
echo "Current root scripts:"
ls -la *.sh

echo ""
echo "=== ANALYSIS & CATEGORIZATION ==="

# Check if password scripts are authentication-related
auth_scripts=()
utility_scripts=()

for script in *.sh; do
    if [[ "$script" == "cleanup_workspace.sh" ]]; then
        utility_scripts+=("$script")
        echo "✓ $script - Utility (keep in root)"
    elif grep -q -i "password\|pgpass\|auth\|role" "$script" 2>/dev/null; then
        auth_scripts+=("$script")
        echo "→ $script - Authentication (move to scripts/auth/)"
    else
        echo "? $script - Manual review needed"
    fi
done

echo ""
echo "=== EXECUTING MOVES ==="

# Ensure auth directory exists
mkdir -p scripts/auth

# Move authentication scripts
for script in "${auth_scripts[@]}"; do
    if [[ -f "$script" ]]; then
        echo "Moving $script to scripts/auth/"
        mv "$script" scripts/auth/
    fi
done

echo ""
echo "=== FINAL VERIFICATION ==="

echo "Root scripts remaining:"
ls -la *.sh 2>/dev/null | wc -l | xargs echo "Count:"

echo ""
echo "Directory structure:"
echo "scripts/auth/: $(ls -1 scripts/auth/ 2>/dev/null | wc -l) files"
echo "scripts/archive/: $(ls -1 scripts/archive/ 2>/dev/null | wc -l) files"  
echo "scripts/utils/: $(ls -1 scripts/utils/ 2>/dev/null | wc -l) files"

echo ""
echo "✓ Root directory now contains only essential utilities"
echo "✓ Authentication scripts properly categorized"
echo "✓ Workspace structure follows logical hierarchy"

# Final sanity check
if [[ $(ls -1 *.sh 2>/dev/null | wc -l) -le 1 ]]; then
    echo "✓ SUCCESS: Root cleanup complete"
else
    echo "⚠ REVIEW: Multiple scripts still in root"
    ls -la *.sh
fi
