#!/bin/bash
#
# Query WiGLE API for Orphan Networks (Batch)
#
# Tests querying 100 orphan BSSIDs to see if rate limited
#
# Set your WiGLE API credentials:
# export WIGLE_API_NAME="your_api_name"
# export WIGLE_API_TOKEN="your_api_token"
#

set -e

BATCH_FILE="${1:-/tmp/orphan_batch_100.txt}"
OUTPUT_DIR="$(dirname "$0")/orphan_responses"
WIGLE_API_NAME="${WIGLE_API_NAME:-}"
WIGLE_API_TOKEN="${WIGLE_API_TOKEN:-}"

if [ -z "$WIGLE_API_NAME" ] || [ -z "$WIGLE_API_TOKEN" ]; then
    echo "Error: WiGLE API credentials not set"
    echo ""
    echo "Set environment variables:"
    echo "  export WIGLE_API_NAME=\"your_api_name\""
    echo "  export WIGLE_API_TOKEN=\"your_api_token\""
    echo ""
    echo "Get credentials from: https://wigle.net/account"
    exit 1
fi

if [ ! -f "$BATCH_FILE" ]; then
    echo "Error: Batch file not found: $BATCH_FILE"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  WiGLE API Orphan Query - Batch Test                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Batch file: $BATCH_FILE"
echo "Output dir: $OUTPUT_DIR"
echo ""

# Count BSSIDs
total=$(wc -l < "$BATCH_FILE")
echo "Total BSSIDs to query: $total"
echo ""

success=0
failed=0
rate_limited=0
not_found=0
count=0

start_time=$(date +%s)

while IFS= read -r bssid; do
    count=$((count + 1))

    # Progress indicator
    printf "[%3d/%3d] %-17s ... " "$count" "$total" "$bssid"

    # Query WiGLE API
    response_file="$OUTPUT_DIR/response_${bssid//:/_}.json"
    http_code=$(curl -s -w "%{http_code}" -o "$response_file" \
        -u "$WIGLE_API_NAME:$WIGLE_API_TOKEN" \
        "https://api.wigle.net/api/v2/network/detail?netid=$bssid")

    # Check response
    if [ "$http_code" = "200" ]; then
        # Check if actual data returned
        if grep -q '"success":true' "$response_file" 2>/dev/null; then
            echo "✓ OK"
            success=$((success + 1))
        else
            echo "✗ Not found"
            not_found=$((not_found + 1))
            rm -f "$response_file"
        fi
    elif [ "$http_code" = "429" ]; then
        echo "⚠ RATE LIMITED"
        rate_limited=$((rate_limited + 1))
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "⚠️  Rate limit hit at request #$count"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        break
    elif [ "$http_code" = "401" ]; then
        echo "✗ AUTH FAILED"
        echo ""
        echo "Authentication failed. Check your API credentials."
        exit 1
    else
        echo "✗ HTTP $http_code"
        failed=$((failed + 1))
        rm -f "$response_file"
    fi

    # Small delay to be polite
    sleep 0.5

done < "$BATCH_FILE"

end_time=$(date +%s)
elapsed=$((end_time - start_time))

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Batch Query Results                                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Total queried:   $count / $total"
echo "Successful:      $success"
echo "Not found:       $not_found"
echo "Failed:          $failed"
echo "Rate limited:    $rate_limited"
echo ""
echo "Elapsed time:    ${elapsed}s"
echo "Rate:            $(awk "BEGIN {printf \"%.2f\", $count/$elapsed}") req/s"
echo ""

if [ $rate_limited -gt 0 ]; then
    echo "⚠️  Rate limit encountered at request #$count"
    echo "   WiGLE API limit appears to be ~$count requests before limiting"
    echo ""
fi

if [ $success -gt 0 ]; then
    echo "✓ Saved $success responses to: $OUTPUT_DIR/"
    echo ""
    echo "To import into database:"
    echo "  cd $OUTPUT_DIR"
    echo "  for f in response_*.json; do"
    echo "    python3 ../import_network_detail.py \"\$f\""
    echo "  done"
    echo ""
fi

exit 0
