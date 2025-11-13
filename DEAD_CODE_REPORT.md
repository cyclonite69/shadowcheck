# Dead Code Analysis - Major Findings
**Date:** 2025-11-13
**Target:** 40% reduction (16,186 lines from 40,466 total)

## CRITICAL FINDING: Unused API Routes

### ❌ COMPLETELY UNUSED Route Files (2,186 lines)

These route files are **NOT imported** in `server/index.ts`:

| File | Lines | Status | Reason |
|------|-------|--------|--------|
| `classification.ts` | 660 | ❌ DEAD | Never imported |
| `federatedObservations.ts` | 623 | ❌ DEAD | Never imported |
| `sourceComparison.ts` | 525 | ❌ DEAD | Never imported |
| `networks.ts` | 141 | ❌ DEAD | Duplicate (inline in index.ts) |
| `metrics.ts` | 119 | ❌ DEAD | Duplicate (inline in index.ts) |
| `analytics.ts` | 57 | ❌ DEAD | Duplicate (inline in index.ts) |
| `within.ts` | 61 | ❌ DEAD | Duplicate (inline in index.ts) |

**Subtotal: 2,186 lines** of pure dead code

---

## Active Routes (Actually Used)

✅ **Imported and used in server/index.ts:**
- `health.ts` (218 lines)
- `visualize.ts` (58 lines)
- `surveillance.ts` (583 lines)
- `pipelines.ts` (935 lines)
- `accessPoints.ts` (408 lines)
- `wigleEnrichment.ts` (571 lines)

---

## Progress Tracking

### Cleanup So Far:
1. ✅ future_iterations/ directories: **6,415 lines removed**
2. ✅ Deprecated files: **501 lines removed**

### New Findings:
3. ⬜ Unused API routes: **2,186 lines** (identified)

**Current total identified: 9,102 lines (22.5% of codebase)**

**Still need:** ~7,084 more lines to hit 40% target

---

## Next Steps

1. Delete unused route files (2,186 lines)
2. Analyze React components for unused code
3. Check for unused utility functions
4. Review schema files again

**Ready for immediate deletion:**
```bash
git rm server/routes/classification.ts
git rm server/routes/federatedObservations.ts
git rm server/routes/sourceComparison.ts
git rm server/routes/networks.ts
git rm server/routes/metrics.ts
git rm server/routes/analytics.ts
git rm server/routes/within.ts
```
