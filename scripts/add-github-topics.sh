#!/bin/bash
# Script to add GitHub topics to your repository
# This requires a GitHub Personal Access Token with 'repo' scope

# Repository information
REPO_OWNER="cyclonite69"
REPO_NAME="shadowcheck"

# Topics to add (maximum 20 allowed by GitHub)
TOPICS=(
    "sigint"
    "signals-intelligence"
    "wireless-forensics"
    "network-forensics"
    "threat-detection"
    "security-analytics"
    "counter-surveillance"
    "wardriving"
    "spatial-analysis"
    "geospatial-intelligence"
    "postgresql"
    "postgis"
    "docker"
    "monitoring"
    "prometheus"
    "grafana"
    "typescript"
    "react"
    "full-stack"
    "api"
)

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== GitHub Topics Setup ===${NC}"
echo ""
echo "This script will add ${#TOPICS[@]} topics to your repository."
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✓ GitHub CLI (gh) detected${NC}"
    echo ""
    echo "Adding topics using GitHub CLI..."

    # Join topics with commas
    TOPICS_STRING=$(IFS=,; echo "${TOPICS[*]}")

    # Add topics using gh CLI
    gh repo edit "$REPO_OWNER/$REPO_NAME" --add-topic "$TOPICS_STRING"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Topics added successfully!${NC}"
        echo ""
        echo "View your topics at: https://github.com/$REPO_OWNER/$REPO_NAME"
    else
        echo -e "${RED}✗ Failed to add topics${NC}"
        exit 1
    fi
else
    # Fallback to curl if gh is not available
    echo -e "${BLUE}GitHub CLI not found. Using curl instead...${NC}"
    echo ""

    # Check for GitHub token
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}ERROR: GITHUB_TOKEN environment variable not set${NC}"
        echo ""
        echo "Please create a Personal Access Token:"
        echo "1. Go to: https://github.com/settings/tokens/new"
        echo "2. Select scope: 'repo' (Full control of private repositories)"
        echo "3. Generate token"
        echo "4. Export it: export GITHUB_TOKEN='your_token_here'"
        echo ""
        echo "Then run this script again."
        exit 1
    fi

    # Create JSON payload with topics
    TOPICS_JSON=$(printf '%s\n' "${TOPICS[@]}" | jq -R . | jq -s .)
    PAYLOAD=$(jq -n --argjson names "$TOPICS_JSON" '{names: $names}')

    echo "Adding topics via GitHub API..."

    # Make API request
    RESPONSE=$(curl -s -X PUT \
        -H "Accept: application/vnd.github.mercy-preview+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/topics" \
        -d "$PAYLOAD")

    # Check response
    if echo "$RESPONSE" | grep -q '"names"'; then
        echo -e "${GREEN}✓ Topics added successfully!${NC}"
        echo ""
        echo "Topics added:"
        echo "$RESPONSE" | jq -r '.names[]' | sed 's/^/  - /'
        echo ""
        echo "View your topics at: https://github.com/$REPO_OWNER/$REPO_NAME"
    else
        echo -e "${RED}✗ Failed to add topics${NC}"
        echo ""
        echo "Response:"
        echo "$RESPONSE" | jq .
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}=== Done! ===${NC}"
echo ""
echo "Your repository now has enhanced discoverability on GitHub!"
