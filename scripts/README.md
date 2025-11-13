# ShadowCheck Setup Scripts

This directory contains automation scripts for GitHub repository setup and management.

## 🚀 Quick Start

The easiest way to complete GitHub setup in one command:

```bash
# Add topics and create PR (assumes main branch)
./scripts/quick-setup.sh

# Or specify a different base branch
./scripts/quick-setup.sh master
```

This will:
1. Add 20 GitHub topics for maximum discoverability
2. Create a pull request with all your changes

## 📋 Individual Scripts

### 1. `add-github-topics.sh` - Add GitHub Topics

Automatically adds 20 curated topics to your repository for maximum discoverability.

**Topics Added:**
- sigint, signals-intelligence, wireless-forensics
- network-forensics, threat-detection, security-analytics
- counter-surveillance, wardriving, spatial-analysis
- geospatial-intelligence, postgresql, postgis
- docker, monitoring, prometheus, grafana
- typescript, react, full-stack, api

**Usage:**

```bash
# Option 1: With GitHub CLI (recommended)
./scripts/add-github-topics.sh

# Option 2: With curl and GITHUB_TOKEN
export GITHUB_TOKEN='your_personal_access_token'
./scripts/add-github-topics.sh
```

**Creating a GitHub Token:**
1. Go to: https://github.com/settings/tokens/new
2. Give it a name: "ShadowCheck Topics"
3. Select scope: `repo` (Full control of private repositories)
4. Generate token
5. Copy the token
6. Export: `export GITHUB_TOKEN='ghp_your_token_here'`

### 2. `create-pull-request.sh` - Create Pull Request

Creates a comprehensive pull request with detailed description of all changes.

**Usage:**

```bash
# Create PR to main branch (default)
./scripts/create-pull-request.sh

# Create PR to specific branch
./scripts/create-pull-request.sh master
./scripts/create-pull-request.sh develop
```

**Requirements:**
- GitHub CLI installed: `brew install gh` (macOS) or see [installation](https://github.com/cli/cli#installation)
- Authenticated: `gh auth login`

**PR Includes:**
- Complete changelog of all improvements
- Feature highlights
- Testing checklist
- Next steps for after merge
- Professional formatting

### 3. `quick-setup.sh` - Complete Setup

Runs both scripts in sequence for a one-command setup.

**Usage:**

```bash
./scripts/quick-setup.sh [base-branch]
```

**What It Does:**
1. Adds GitHub topics (Step 1/2)
2. Creates pull request (Step 2/2)
3. Provides summary of next steps

---

## 🔧 Prerequisites

### For Topics (choose one):

**Option A: GitHub CLI (Easiest)**
```bash
# Install
brew install gh  # macOS
# or see: https://github.com/cli/cli#installation

# Authenticate
gh auth login
```

**Option B: Personal Access Token**
```bash
# Create token at: https://github.com/settings/tokens/new
# Scope needed: 'repo'

export GITHUB_TOKEN='ghp_your_token_here'
```

### For Pull Request:

**GitHub CLI Required**
```bash
# Install
brew install gh  # macOS
# or: apt install gh  # Debian/Ubuntu
# or: https://github.com/cli/cli#installation

# Authenticate
gh auth login
```

---

## 📝 Manual Alternatives

### Manually Add Topics

If scripts don't work, add topics via GitHub UI:

1. Go to your repository: https://github.com/cyclonite69/shadowcheck
2. Click the ⚙️ gear icon next to "About"
3. Add these topics (comma or space separated):
   ```
   sigint, signals-intelligence, wireless-forensics, network-forensics,
   threat-detection, security-analytics, counter-surveillance, wardriving,
   spatial-analysis, geospatial-intelligence, postgresql, postgis, docker,
   monitoring, prometheus, grafana, typescript, react, full-stack, api
   ```
4. Save changes

### Manually Create PR

If PR script doesn't work:

1. Go to: https://github.com/cyclonite69/shadowcheck
2. Click "Pull requests" tab
3. Click "New pull request"
4. Select:
   - **base**: main (or your default branch)
   - **compare**: claude/push-local-to-github-011CV5YLdzoTRRakKBnbne1T
5. Click "Create pull request"
6. Use this template:

```markdown
## 🎯 Overview
This PR includes comprehensive improvements for repository exposure, new features, and enhanced documentation.

## ✨ What's New
- Enhanced README with professional badges and formatting
- MIT LICENSE for open source distribution
- Complete CONTRIBUTING.md guide
- Marketing playbook with 40+ topics
- Simplified security display app-wide
- 9 new API endpoints
- Docker volume cleanup guide

## 🚀 Next Steps
1. Merge this PR
2. Add GitHub topics
3. Take screenshots
4. Start promotion
```

---

## 🆘 Troubleshooting

### "gh: command not found"
**Solution:** Install GitHub CLI
```bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Other: https://github.com/cli/cli#installation
```

### "Not authenticated with GitHub"
**Solution:** Authenticate with gh CLI
```bash
gh auth login
# Follow the prompts
```

### "GITHUB_TOKEN not set"
**Solution:** Create and export token
```bash
# 1. Create token: https://github.com/settings/tokens/new
# 2. Select scope: 'repo'
# 3. Export it:
export GITHUB_TOKEN='ghp_your_token_here'
```

### "jq: command not found"
**Solution:** Install jq (JSON processor)
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq

# Or use GitHub CLI instead (doesn't need jq)
```

### "API rate limit exceeded"
**Solution:** Authenticate (increases rate limit from 60 to 5000/hour)
```bash
gh auth login
# or
export GITHUB_TOKEN='your_token'
```

---

## 📚 Additional Resources

- **GitHub CLI Docs**: https://cli.github.com/manual/
- **GitHub API Docs**: https://docs.github.com/en/rest
- **Personal Access Tokens**: https://github.com/settings/tokens
- **Marketing Guide**: `../GITHUB_MARKETING_GUIDE.md`
- **Contributing Guide**: `../CONTRIBUTING.md`

---

## ✅ Verification

After running scripts, verify:

```bash
# Check topics were added
curl -s https://api.github.com/repos/cyclonite69/shadowcheck | jq .topics

# Check PR was created
gh pr list --repo cyclonite69/shadowcheck

# Or visit directly
# Topics: https://github.com/cyclonite69/shadowcheck
# PRs: https://github.com/cyclonite69/shadowcheck/pulls
```

---

**Need help?** Open an issue or check the troubleshooting section above.
