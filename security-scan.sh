#!/bin/bash
# Quick security intrusion check

echo "🔍 Security Scan - Intrusion Detection"
echo "======================================"
echo ""

# 1. Check for unexpected listening ports
echo "1. Open Ports (should only be Docker-related):"
ss -tlnp | grep LISTEN | grep -v "127.0.0.1" | head -20
echo ""

# 2. Check for unauthorized Docker containers
echo "2. Running Containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
echo ""

# 3. Check for recent file modifications in critical dirs
echo "3. Recently Modified Files (last 24h):"
find . -type f -mtime -1 -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" | head -20
echo ""

# 4. Check for suspicious processes
echo "4. Unexpected Processes (non-root, high CPU):"
ps aux | awk '$3 > 10.0 && $1 != "root"' | head -10
echo ""

# 5. Check git status for uncommitted changes
echo "5. Git Status (uncommitted changes could indicate tampering):"
git status --short | head -20
echo ""

# 6. Check for backdoor patterns in code
echo "6. Scanning for Common Backdoor Patterns:"
grep -r "eval(" server/ client/src/ --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | xargs -I {} echo "  eval() calls: {}"
grep -r "exec(" server/ --include="*.js" --include="*.ts" 2>/dev/null | wc -l | xargs -I {} echo "  exec() calls: {}"
grep -r "child_process" server/ --include="*.js" --include="*.ts" 2>/dev/null | wc -l | xargs -I {} echo "  child_process usage: {}"
echo ""

# 7. Check Docker image integrity
echo "7. Docker Image Hashes:"
docker images --format "{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}" | grep shadowcheck
echo ""

echo "✅ Scan complete"
