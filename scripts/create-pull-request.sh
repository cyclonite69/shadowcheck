#!/bin/bash
# Script to create a Pull Request for the marketing enhancements
# This requires GitHub CLI (gh) installed and authenticated

# Repository information
REPO_OWNER="cyclonite69"
REPO_NAME="shadowcheck"
BRANCH_NAME="claude/push-local-to-github-011CV5YLdzoTRRakKBnbne1T"
BASE_BRANCH="${1:-main}"  # Default to 'main', but accept argument

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Create Pull Request ===${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}✗ GitHub CLI (gh) is not installed${NC}"
    echo ""
    echo "Please install GitHub CLI:"
    echo "  - macOS:   brew install gh"
    echo "  - Linux:   See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  - Windows: See https://github.com/cli/cli#installation"
    echo ""
    echo "After installation, authenticate with: gh auth login"
    echo ""
    echo -e "${YELLOW}Alternative: Create PR manually at:${NC}"
    echo "https://github.com/$REPO_OWNER/$REPO_NAME/compare/$BASE_BRANCH...$BRANCH_NAME"
    exit 1
fi

# Check if authenticated
if ! gh auth status &>/dev/null; then
    echo -e "${RED}✗ Not authenticated with GitHub${NC}"
    echo ""
    echo "Please authenticate: gh auth login"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
echo ""

# PR title and body
PR_TITLE="🚀 Major Update: Enhanced Marketing, Documentation, and Features"

PR_BODY="## 🎯 Overview

This PR includes comprehensive improvements for repository exposure, new features, and enhanced documentation.

## ✨ What's New

### 1. 📸 Enhanced README.md
- Professional centered header with badges
- 10+ technology badges (TypeScript, React, PostgreSQL, Docker, etc.)
- Live star/fork/issue counters
- Feature comparison table
- ASCII architecture diagram
- Complete API documentation (30+ endpoints)
- Clear 5-minute quickstart
- Comprehensive roadmap
- Star History chart integration

### 2. 📄 New Documentation
- **LICENSE** (MIT) - Open source license
- **CONTRIBUTING.md** - Complete contribution guidelines
- **GITHUB_MARKETING_GUIDE.md** - Marketing playbook with 40+ topics
- **docs/images/README.md** - Screenshot guidelines

### 3. 🎨 Visual & UX Improvements
- Simplified security display app-wide (WPA2, WPA3, WEP)
- Hover tooltips for detailed security information
- Applied to: Network table, filters, dashboard, Mapbox tooltips
- Removed pill styling for cleaner look

### 4. 🔌 API Enhancements
- Added 9 new endpoints to admin test panel:
  - Access Points category (2 endpoints)
  - WiGLE Enrichment category (4 endpoints)
  - Additional Surveillance endpoints (3 endpoints)
- Complete endpoint testing coverage

### 5. 📚 Documentation Updates
- Docker volume cleanup guide
- Environment configuration best practices
- Security hardening guidelines

## 📊 Impact

### Marketing & Exposure:
- 40+ recommended GitHub topics for discoverability
- Professional presentation matching enterprise tools
- Clear contribution pathway
- Complete promotion strategy

### User Experience:
- Simplified security type display
- Intuitive hover tooltips
- Comprehensive API testing interface
- Better onboarding documentation

### Developer Experience:
- Clear contribution guidelines
- Development setup instructions
- Code style guide with examples
- Testing guidelines

## 🧪 Testing

- [x] All existing tests pass
- [x] New features manually tested
- [x] Documentation reviewed
- [x] No breaking changes

## 📝 Commits Included

- feat: Add hover tooltip to Mapbox security display
- feat: Add missing API endpoints to admin test panel
- docs: Add Docker volume and cleanup guide
- feat: Maximize GitHub exposure with enhanced marketing materials

## 🚀 Next Steps

After merging:
1. Add GitHub topics (see \`scripts/add-github-topics.sh\`)
2. Take screenshots for docs/images/
3. Create social preview image (1280x640px)
4. Begin promotion campaign (see GITHUB_MARKETING_GUIDE.md)

## 📸 Screenshots

_Screenshots will be added to \`docs/images/\` after merge_

## 🔗 Related Issues

Closes #[issue-number] (if applicable)

## ✅ Checklist

- [x] Code follows style guidelines
- [x] Documentation updated
- [x] No sensitive data exposed
- [x] All commits have clear messages
- [x] Ready for review

---

**Ready to merge and start promoting! 🎉**"

echo "Creating pull request..."
echo ""
echo "Title: $PR_TITLE"
echo "From:  $BRANCH_NAME"
echo "To:    $BASE_BRANCH"
echo ""

# Create the PR
gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --base "$BASE_BRANCH" \
    --head "$BRANCH_NAME" \
    --repo "$REPO_OWNER/$REPO_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Pull Request created successfully!${NC}"
    echo ""
    echo "View your PR:"
    gh pr view --web
else
    echo ""
    echo -e "${RED}✗ Failed to create PR${NC}"
    echo ""
    echo -e "${YELLOW}Create PR manually at:${NC}"
    echo "https://github.com/$REPO_OWNER/$REPO_NAME/compare/$BASE_BRANCH...$BRANCH_NAME"
    exit 1
fi
