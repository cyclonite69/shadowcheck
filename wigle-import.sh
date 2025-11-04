#!/bin/bash
# WiGLE API Import Wrapper
# Run this from the host to import BSSIDs from enrichment queue

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
LIMIT=10

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --limit)
            LIMIT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: ./wigle-import.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --limit N     Process N BSSIDs from queue (default: 10)"
            echo "  --help        Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./wigle-import.sh              # Process 10 BSSIDs"
            echo "  ./wigle-import.sh --limit 50   # Process 50 BSSIDs"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${YELLOW}WiGLE API Import Tool${NC}"
echo -e "${YELLOW}=====================${NC}"
echo ""
echo "Processing up to ${LIMIT} BSSIDs from enrichment queue..."
echo ""

# Run the import inside the backend container
docker exec shadowcheck_backend bash -c "
    cd /app/server/pipelines/enrichment && \
    export WIGLE_API_KEY='AIDc40fa13ea2238ef65909f4a816b48e60:5798dce2f34b8e730fef29f4193f4252' && \
    export PGHOST='postgres' && \
    python3 -u wigle_api_alpha_v3.py --process-queue --limit ${LIMIT}
"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Import completed successfully!${NC}"
else
    echo -e "${RED}✗ Import failed with exit code ${EXIT_CODE}${NC}"
fi

exit $EXIT_CODE
