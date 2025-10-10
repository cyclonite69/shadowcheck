# Shadowcheck Repository Cruft Inventory
**Date:** 2025-10-10
**Scan Location:** /home/nunya/shadowcheck

## Executive Summary
- **Total Files Found:** 6
- **Total Size:** 24,644 bytes (24.1 KB)
- **Categories:** Backup files (4), Generated files (1), Log files (1)

---

## Detailed Inventory by Category

### 1. BACKUP FILES (4 files, 21,237 bytes, 86.2%)

| File | Size | Last Modified | Directory |
|------|------|---------------|-----------|
| NetworkMap.tsx.bak | 7,515 bytes (7.3 KB) | 2025-10-09 19:04:05 | client/src/components/Map/ |
| analytics.ts.bak | 1,820 bytes (1.8 KB) | 2025-10-09 19:04:05 | server/routes/ |
| index.ts.backup | 8,152 bytes (8.0 KB) | 2025-10-09 19:04:05 | server/ |
| index.ts.bak | 3,750 bytes (3.7 KB) | 2025-10-09 19:04:05 | server/ |

**Full Paths:**
```
/home/nunya/shadowcheck/client/src/components/Map/NetworkMap.tsx.bak
/home/nunya/shadowcheck/server/routes/analytics.ts.bak
/home/nunya/shadowcheck/server/index.ts.backup
/home/nunya/shadowcheck/server/index.ts.bak
```

---

### 2. GENERATED/TEMPORARY FILES (1 file, 2,788 bytes, 11.3%)

| File | Size | Last Modified | Directory |
|------|------|---------------|-----------|
| GENERATED_PASSWORDS.txt | 2,788 bytes (2.7 KB) | 2025-10-09 18:56:25 | root |

**Full Paths:**
```
/home/nunya/shadowcheck/GENERATED_PASSWORDS.txt
```

**Note:** This file contains generated password information and should be reviewed before archival.

---

### 3. LOG FILES (1 file, 619 bytes, 2.5%)

| File | Size | Last Modified | Directory |
|------|------|---------------|-----------|
| build.log | 619 bytes | 2025-10-10 02:19:27 | root |

**Full Paths:**
```
/home/nunya/shadowcheck/build.log
```

---

## File Age Analysis

| Age | Count | Total Size |
|-----|-------|------------|
| < 1 day old | 1 | 619 bytes |
| 1 day old | 5 | 24,025 bytes |

All cruft files are recent (created Oct 9-10, 2025).

---

## Files NOT Found (searched but absent)
- No vim temp files (~, .swp, .swo)
- No .DS_Store files
- No __pycache__ directories
- No duplicate files with (1), (2), (3) suffixes
- No _copy files (outside of node_modules)
- No .old or .orig files

---

## Archival Plan

Files will be organized into:
```
_archived_cruft_2025-10-10/
├── backup_files/           (4 files, 21.2 KB)
│   ├── client/
│   │   └── src/components/Map/
│   │       └── NetworkMap.tsx.bak
│   └── server/
│       ├── routes/
│       │   └── analytics.ts.bak
│       ├── index.ts.backup
│       └── index.ts.bak
├── temp_files/             (1 file, 2.7 KB)
│   └── GENERATED_PASSWORDS.txt
└── misc_cruft/             (1 file, 619 bytes)
    └── build.log
```

**Total Space to be Recovered:** 24.1 KB
