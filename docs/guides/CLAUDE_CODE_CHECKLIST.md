# Claude Code Pre-Flight Checklist

**Use this checklist EVERY TIME before running Claude Code on ShadowCheck**

---

## ✅ Before Running Claude Code

### 1. Backup Current State
```bash
# Create timestamped backup
mkdir -p ../shadowcheck_backup_$(date +%Y%m%d_%H%M%S)
cp -r . ../shadowcheck_backup_$(date +%Y%m%d_%H%M%S)/

# Commit current state to git
git add -A
git commit -m "Backup before Claude Code session $(date +%Y%m%d_%H%M)"
```

### 2. Document Current Working State
```bash
# Test that everything works NOW
docker-compose -f docker-compose.prod.yml up -d

# Visit each page and verify:
# - http://localhost:5173/ (home)
# - http://localhost:5173/dashboard
# - http://localhost:5173/visualization
# - http://localhost:5173/access-points
# - http://localhost:5173/surveillance

# Write down what works:
echo "✅ Dashboard loads correctly" > WORKING_BEFORE_CLAUDE.txt
echo "✅ Access Points shows data" >> WORKING_BEFORE_CLAUDE.txt
# etc...
```

### 3. Identify Exact Problem
```markdown
Write this down before asking Claude Code:

**What is broken?**
- Specific page/component name
- Exact error message (from browser console)
- Steps to reproduce

**What should it do instead?**
- Expected behavior
- Any reference implementations

**What NOT to change?**
- Database schema
- Docker configuration
- Data pipeline code
```

---

## 📝 Crafting the Perfect Prompt

### Template:
```markdown
# Task: [Specific, focused task]

## Context
- Project: ShadowCheck SIGINT forensics platform
- Stack: React + TypeScript, Express, PostgreSQL
- Issue: [Exact problem with file paths and error messages]

## Files Involved
- `client/src/components/[ComponentName].tsx` - [What it does]
- `client/src/hooks/[HookName].ts` - [What it does]

## What to Fix
1. [Specific change #1]
2. [Specific change #2]

## What NOT to Touch
- Do NOT modify `server/db/` or any `.sql` files
- Do NOT change `docker-compose.prod.yml`
- Do NOT alter `pipelines/` directory
- Do NOT edit any `compiled_server/` files

## Acceptance Criteria
- [ ] Component renders without errors
- [ ] TypeScript compiles with `npx tsc --noEmit`
- [ ] No console errors in browser
- [ ] Original functionality still works

## Reference
See PROJECT_RULES.md for coding standards.
```

### Good Prompt Example:
```markdown
# Task: Fix Access Points page crash

## Context
The Access Points page (/access-points) crashes with white screen after 1 second.

Browser console shows:
```
ReferenceError: selectedNetwork is not defined
    at NetworkObservationsTableView.tsx:325
```

## Files Involved
- `client/src/components/NetworkObservationsTableView.tsx` - Table component for network observations
- Uses `selectedNetwork` state variable that is never declared

## What to Fix
1. Add missing state declaration:
   ```typescript
   const [selectedNetwork, setSelectedNetwork] = useState<NetworkObservation | null>(null);
   ```
2. Verify NetworkLocationModal receives this state correctly
3. Ensure no other undefined variables in the component

## What NOT to Touch
- The data fetching logic (useInfiniteNetworkObservations hook) - it works
- The table rendering logic - only fix the modal state
- Any other components

## Acceptance Criteria
- [ ] Page loads without white screen
- [ ] Can view network observations table
- [ ] Modal opens when clicking network (if that functionality exists)
- [ ] No TypeScript errors
```

### Bad Prompt Example (DON'T DO THIS):
```markdown
# ❌ Too vague, will cause problems

"Hey can you make the Access Points page better? 
It's kind of broken and I want it to look nice. 
Also maybe add some new features while you're at it?"

Problems:
- No specific error mentioned
- "Make it better" is subjective
- "Add features" invites scope creep and cruft
- No files specified
- No constraints given
```

---

## 🎯 During Claude Code Session

### Rules to Follow:
1. **One problem at a time** - Don't combine multiple issues in one prompt
2. **Review every change** - Read the diff before accepting
3. **Test immediately** - Verify the fix works before moving on
4. **Ask "why"** - If you don't understand a change, ask Claude Code to explain

### Red Flags (Stop Immediately):
- 🚩 Claude Code wants to modify database schema
- 🚩 Changes to files in `compiled_server/`
- 🚩 Modifications to `docker-compose.prod.yml` volumes
- 🚩 Adding new dependencies without asking
- 🚩 Deleting files without confirming
- 🚩 Creating "experimental" versions of existing components

### Questions to Ask:
```markdown
Before accepting changes:

1. "What exactly does this change do?"
2. "Why is this approach better than what was there?"
3. "Could this break anything else?"
4. "Do I need to rebuild or restart anything?"
5. "Is this creating any new cruft?"
```

---

## ✅ After Claude Code Session

### 1. Test Everything
```bash
# Rebuild
cd client && npm run build && cd ..

# Type check
cd client && npx tsc --noEmit && cd ..

# Restart stack
docker-compose -f docker-compose.prod.yml restart backend

# Test in browser
# Visit ALL pages, not just the one you changed
```

### 2. Review All Changes
```bash
# See what changed
git status
git diff

# Review each file
git diff client/src/components/[ModifiedFile].tsx

# Make sure no cruft was created
find . -name "*.old" -o -name "*.backup"
```

### 3. Commit Thoughtfully
```bash
# Stage specific files (not everything)
git add client/src/components/NetworkObservationsTableView.tsx

# Commit with context
git commit -m "Fix: Access Points page crash - added missing selectedNetwork state

- Added useState for selectedNetwork (singular) for modal
- Existing selectedNetworks (plural) is for checkboxes
- Fixes ReferenceError that caused white screen
"

# Tag if this is a major fix
git tag -a v1.0.1 -m "Fixed Access Points page crash"
```

### 4. Document What Works Now
```bash
# Update the working state log
echo "✅ Access Points page loads correctly" >> WORKING_AFTER_CLAUDE.txt
echo "✅ Can view network observations" >> WORKING_AFTER_CLAUDE.txt

# Compare before/after
diff WORKING_BEFORE_CLAUDE.txt WORKING_AFTER_CLAUDE.txt
```

### 5. Check for Cruft
```bash
# Find any new experimental files
git status --short | grep "??"

# Find any commented-out code added
git diff | grep "^+.*\/\/"

# If cruft found, clean it up NOW
```

---

## 🚨 Emergency Rollback

If Claude Code breaks something badly:

### Quick Rollback:
```bash
# Undo uncommitted changes
git checkout .

# OR revert last commit
git revert HEAD

# Rebuild and restart
cd client && npm run build && cd ..
docker-compose -f docker-compose.prod.yml restart
```

### Full Restore from Backup:
```bash
# Copy working version from backup
cp -r ../shadowcheck_backup_YYYYMMDD_HHMM/* .

# Rebuild
cd client && npm install && npm run build && cd ..

# Restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Claude Code Session Template

Copy this for each session:

```markdown
# Claude Code Session Log
**Date**: YYYY-MM-DD
**Goal**: [One specific thing to fix/improve]

## Pre-Session State
- [ ] Backup created: ../shadowcheck_backup_YYYYMMDD_HHMM
- [ ] Git commit made: [commit hash]
- [ ] Tested working pages: [list]
- [ ] Documented current issues: [list]

## Changes Made
1. File: `[path]`
   - Change: [what changed]
   - Reason: [why]

2. File: `[path]`
   - Change: [what changed]
   - Reason: [why]

## Testing Results
- [ ] npm run build - SUCCESS/FAILED
- [ ] npx tsc --noEmit - SUCCESS/FAILED
- [ ] Docker restart - SUCCESS/FAILED
- [ ] Home page loads - SUCCESS/FAILED
- [ ] Dashboard loads - SUCCESS/FAILED
- [ ] Access Points loads - SUCCESS/FAILED
- [ ] Visualization loads - SUCCESS/FAILED

## Issues Found
- [Any new problems discovered]
- [Any regressions]

## Commit Message
```
[Type]: [Brief summary]

[Detailed explanation of what changed and why]

[Any side effects or related changes]
```

## Next Session
- [ ] Item to tackle next time
- [ ] Cleanup needed
- [ ] Documentation to write
```

---

## 🎓 Learning from Past Sessions

### Common Patterns That Caused Cruft:
1. **"Make it better"** prompts → Adds features nobody asked for
2. **Scope creep** → "While you're there, also..." creates mess
3. **Not testing immediately** → Multiple broken changes stack up
4. **Accepting without reviewing** → Cruft silently accumulates
5. **No constraints given** → Claude Code makes assumptions

### Best Practices Learned:
1. ✅ **Surgical prompts** - One specific fix
2. ✅ **Explicit constraints** - Tell it what NOT to touch
3. ✅ **Immediate testing** - Verify before next change
4. ✅ **Read all diffs** - Understand every change
5. ✅ **Commit frequently** - Easy to rollback if needed

---

**Remember: Claude Code is a power tool. Used carefully with constraints and testing, it's incredibly helpful. Used carelessly, it creates technical debt and cruft.**

**Always: Measure twice, cut once.**
