#!/bin/bash
#
# Batch Import WiGLE Network Detail Files
#
# This script identifies and imports all network detail response files
# (skips search result files)

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        WiGLE Network Detail Batch Import                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

imported=0
skipped=0
failed=0
total=0

# Find all response JSON files
for file in response_*.json; do
    [ -f "$file" ] || continue

    total=$((total + 1))

    # Check if it's a network detail file (has trilateratedLatitude)
    if head -20 "$file" | grep -q "trilateratedLatitude"; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📡 Processing: $file"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        if python3 import_network_detail.py "$file" 2>&1; then
            imported=$((imported + 1))
            echo "✅ Success"
        else
            failed=$((failed + 1))
            echo "❌ Failed"
        fi
        echo ""
    else
        # Skip search result files
        skipped=$((skipped + 1))
        echo "⏭️  Skipped: $file (search result format)"
    fi
done

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Import Summary                            ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Total files:     $(printf '%3d' $total)                                       ║"
echo "║  Imported:        $(printf '%3d' $imported)                                       ║"
echo "║  Skipped:         $(printf '%3d' $skipped)                                       ║"
echo "║  Failed:          $(printf '%3d' $failed)                                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"

if [ $failed -gt 0 ]; then
    exit 1
fi
