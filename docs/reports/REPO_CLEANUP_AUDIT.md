# ChargeMesh — Complete Repository Cleanup & Organization Report

> **Date:** 2026-08-24 | **Status:** AWAITING YOUR APPROVAL — No files have been modified.  
> Review each section and approve the cleanup plan before I execute anything.

---

## A. Current Project Structure (Annotated)

```
chargemesh-app/                         ← Repository root
├── .agents/                            ✅ Keep — agent rules & skills
├── .config/project.config.json         ✅ Keep — tooling metadata
├── .docs/                              ⚠️ Planning archive (historical)
│   ├── ChargeMesh_Legal_Documentation.md  (40 KB) — historical planning
│   ├── ChargeMesh_Project_Documentation.md (25 KB) — historical planning
│   ├── ChargeMesh_Technical_Documentation.md (35 KB) — historical planning
│   ├── ChargeMesh_UIUX_Documentation.md (33 KB) — historical planning
│   ├── PLANNING_DOCUMENTS.md           ✅ Index added (Phase D)
│   └── archive/
│       ├── README.md                   ✅ Archive index
│       ├── TASKS.md                    ✅ Archived task list
│       └── planning-documents/         (empty — original DOCX files were missing)
├── .env.example                        ✅ Keep — root backend env template
├── .git/                               ✅ Keep (not committed)
├── .gitattributes                      ✅ Keep
├── .gitignore                          ✅ Keep (updated Phase C)
├── .github/
│   ├── CONTRIBUTING.md                 ✅ Keep
│   ├── GIT_STRATEGY.md                 ✅ Keep
│   ├── ISSUE_TEMPLATE/                 ❌ Empty directory — remove
│   ├── pull_request_template.md        ✅ Keep
│   └── workflows/ (3 CI YMLs)          ✅ Keep
├── CHANGELOG.md                        ✅ Keep (root, correct)
├── DESIGN_SYSTEM.md                    ⚠️ Misplaced — at root, belongs in docs/
├── DEVELOPMENT_RULES.md                ✅ Keep (referenced by GEMINI.md)
├── GEMINI.md                           ✅ Keep (agent rules)
├── LICENSE                             ✅ Keep
├── README.md                           ✅ Keep (root, correct)
├── apps/
│   ├── admin/                          🚧 Scaffolded only
│   │   ├── tsconfig.tsbuildinfo        ❌ Build cache — gitignored, delete locally
│   │   └── src/index.ts                ✅ Keep (scaffold)
│   ├── backend/                        🚧 Scaffolded only
│   │   ├── dist/                       ❌ Compiled output — gitignored, delete locally
│   │   └── src/ (scaffold)             ✅ Keep
│   └── mobile/                         ✅ Fully implemented
│       ├── tsconfig.tsbuildinfo        ❌ Build cache — gitignored, delete locally
│       ├── src/
│       │   ├── assets/
│       │   │   ├── logo/
│       │   │   │   ├── cm_fevicon_logo_trans.png    ✅ Used (SplashScreen, OnboardingScreen)
│       │   │   │   ├── cm_fevicon_logo.png          ❌ No imports found — unused
│       │   │   │   ├── cm_logo.png                  ❌ No imports found — unused
│       │   │   │   ├── cm_web_logo.png              ❌ No imports found — unused (web asset)
│       │   │   │   └── cm_web_logo_trans.png        ❌ No imports found — unused (web asset)
│       │   │   ├── obscreens/
│       │   │   │   ├── evob_1.png                   ✅ Used (OnboardingScreen)
│       │   │   │   ├── evob_2.png                   ✅ Used (OnboardingScreen)
│       │   │   │   └── evob_3.png                   ✅ Used (OnboardingScreen)
│       │   │   └── splash_bg.png                    ✅ Used (Splash, Login, Register)
│       │   ├── components/ (20 files)   ✅ All used
│       │   ├── context/ (7 files)       ✅ All used
│       │   ├── data/
│       │   │   ├── evCatalog.json       ✅ Used (AddVehicleScreen)
│       │   │   ├── stateDistrictMaster.json  ✅ Used (MyAccountScreen) — canonical
│       │   │   └── stateDistrictMaster.ts    ❌ Not imported anywhere — legacy duplicate
│       │   ├── i18n/ (EN + HI)          ✅ All used
│       │   ├── navigation/ (2 files)    ✅ Used
│       │   ├── screens/ (21 files)      ✅ All used
│       │   ├── services/
│       │   │   ├── mockData.ts          ✅ Used
│       │   │   └── walletData.ts        ✅ Used (WalletTransactionsScreen)
│       │   └── theme/ (3 files)         ✅ All used
│       └── android/
│           └── app/
│               ├── build/              ❌ Build output — gitignored, delete locally
│               └── debug.keystore      ✅ Keep (required for debug builds)
├── docker/postgres/init.sql             ✅ Keep (backend phase)
├── docker-compose.yml                   ✅ Keep (backend phase)
├── docs/ (16 files)                     ✅ Keep — current canonical documentation
├── node_modules/                        ✅ Gitignored (not committed)
├── package.json                         ✅ Keep
├── package-lock.json                    ✅ Keep
├── packages/
│   ├── shared-constants/dist/           ❌ Compiled output — gitignored, delete locally
│   ├── shared-types/dist/               ❌ Compiled output — gitignored, delete locally
│   └── tsconfig/                        ✅ Keep
└── src/                                 ❌ ROOT DUPLICATE — 12 MB of files already in apps/mobile/src/assets/
    ├── district-master/
    │   └── State_District_Masters.xlsx  → Archive to .docs/archive/ first
    ├── logo/        (5 files — exact duplicates of mobile/src/assets/logo/)
    ├── obscreens/   (3 files — exact duplicates of mobile/src/assets/obscreens/)
    └── splash-ss/   (1 file  — exact duplicate of mobile/src/assets/splash_bg.png)
```

---

## B. Recommended Clean Structure

The current monorepo architecture is **sound and correct** for a React Native + NestJS + Next.js workspace. No major restructuring is needed. The recommended changes are:

1. Remove the duplicate root `src/` directory
2. Move `DESIGN_SYSTEM.md` from root into `docs/`
3. Delete build artifacts and generated caches
4. Clean up 4 unused logo assets from mobile
5. Remove the redundant `stateDistrictMaster.ts`

```
chargemesh-app/                         ← Clean root
├── .agents/                            ✅ Agent rules (unchanged)
├── .config/                            ✅ Tooling config (unchanged)
├── .docs/                              ✅ Historical archive (labeled, unchanged)
├── .env.example                        ✅ Backend env template
├── .github/                            ✅ CI/CD + contribution guides
│   ├── workflows/ (3 YMLs)
│   ├── CONTRIBUTING.md
│   ├── GIT_STRATEGY.md
│   └── pull_request_template.md
│   [ISSUE_TEMPLATE/ removed — was empty]
├── CHANGELOG.md                        ✅ Version history
├── DEVELOPMENT_RULES.md                ✅ Engineering standards
├── GEMINI.md                           ✅ Agent rules reference
├── LICENSE                             ✅ Proprietary license
├── README.md                           ✅ Project entry point
├── apps/
│   ├── admin/                          🚧 Scaffold (unchanged)
│   ├── backend/                        🚧 Scaffold (unchanged, dist/ removed)
│   └── mobile/                         ✅ Full app (cleaned)
│       └── src/
│           ├── assets/
│           │   ├── logo/
│           │   │   └── cm_fevicon_logo_trans.png  [only used logo kept]
│           │   ├── obscreens/ (evob_1/2/3.png)
│           │   └── splash_bg.png
│           ├── components/
│           ├── context/
│           ├── data/
│           │   ├── evCatalog.json
│           │   └── stateDistrictMaster.json  [stateDistrictMaster.ts removed]
│           ├── i18n/
│           ├── navigation/
│           ├── screens/
│           ├── services/
│           └── theme/
├── docker/
├── docs/                               ✅ Canonical documentation (17 files)
│   ├── README.md
│   ├── PROJECT_OVERVIEW.md
│   ├── PRODUCT_FEATURES.md
│   ├── SCREENS_AND_NAVIGATION.md
│   ├── BUILD_AND_TESTING.md
│   ├── ARCHITECTURE.md
│   ├── TECHNOLOGY_STACK.md
│   ├── DESIGN_SYSTEM.md                ← moved from root
│   ├── VEHICLE_DATABASE.md
│   ├── CPO_AND_STATIONS.md
│   ├── SECURITY.md
│   ├── LEGAL_PRIVACY.md
│   ├── API_DOCUMENTATION.md            (planned/labeled)
│   ├── DATABASE_SCHEMA.md              (planned/labeled)
│   ├── REQUIREMENTS.md                 (historical/labeled)
│   ├── WORKFLOW.md                     (planned/labeled)
│   └── DEPLOYMENT.md                   (planned/labeled)
├── packages/
│   ├── shared-types/      [dist/ removed]
│   ├── shared-constants/  [dist/ removed]
│   └── tsconfig/
└── [src/ root directory removed entirely]
```

---

## C. Complete Cleanup Table

| # | File / Folder | Category | Why Unnecessary | Imports Found | Recommended Action | Risk |
|---|---------------|----------|----------------|---------------|-------------------|------|
| 1 | `apps/mobile/android/app/build/` | **Safe to Remove** | Gradle build output — regenerated on every build | None | Delete | ✅ Zero |
| 2 | `apps/backend/dist/` (133 files, 376 KB) | **Safe to Remove** | Compiled TypeScript output — gitignored, backend unused | None | Delete | ✅ Zero |
| 3 | `packages/shared-types/dist/` | **Safe to Remove** | Compiled output — now gitignored via `packages/*/dist/` | None | Delete | ✅ Zero |
| 4 | `packages/shared-constants/dist/` | **Safe to Remove** | Same as above | None | Delete | ✅ Zero |
| 5 | `.github/ISSUE_TEMPLATE/` | **Safe to Remove** | Empty directory — Git doesn't track empty dirs | None | Delete | ✅ Zero |
| 6 | `apps/mobile/tsconfig.tsbuildinfo` | **GitHub Exclude** | TS incremental build cache — already gitignored | None | Delete locally | ✅ Zero |
| 7 | `apps/admin/tsconfig.tsbuildinfo` | **GitHub Exclude** | Same as above | None | Delete locally | ✅ Zero |
| 8 | `src/logo/` (5 files, ~3.8 MB) | **Duplicate** | Exact copies of `apps/mobile/src/assets/logo/` — never imported by app | None | Delete after D-1 archived | ✅ Zero |
| 9 | `src/obscreens/` (3 files, ~6 MB) | **Duplicate** | Exact copies of `apps/mobile/src/assets/obscreens/` — never imported | None | Delete | ✅ Zero |
| 10 | `src/splash-ss/splash_bg.png` (~2.4 MB) | **Duplicate** | Exact copy of `apps/mobile/src/assets/splash_bg.png` — never imported | None | Delete | ✅ Zero |
| 11 | `src/district-master/State_District_Masters.xlsx` | **Archive** | Original geo data Excel — source for stateDistrictMaster.json | None | Move → `.docs/archive/` | ✅ Zero |
| 12 | `apps/mobile/src/data/stateDistrictMaster.ts` (~61 KB) | **Duplicate** | All 700+ districts hardcoded in TS — fully superseded by `.json` version | **None** — confirmed by full import scan | Archive then delete | ✅ Low |
| 13 | `apps/mobile/src/assets/logo/cm_fevicon_logo.png` (~942 KB) | **Likely Unnecessary** | Non-transparent logo — no import; transparent version is used instead | None | ⚠️ Confirm before removing | Low |
| 14 | `apps/mobile/src/assets/logo/cm_logo.png` (~780 KB) | **Likely Unnecessary** | No import found in any screen or component | None | ⚠️ Confirm before removing | Low |
| 15 | `apps/mobile/src/assets/logo/cm_web_logo.png` (~425 KB) | **Likely Unnecessary** | Web asset placed in mobile directory — no import found | None | ⚠️ Confirm before removing | Low |
| 16 | `apps/mobile/src/assets/logo/cm_web_logo_trans.png` (~480 KB) | **Likely Unnecessary** | Web asset placed in mobile directory — no import found | None | ⚠️ Confirm before removing | Low |
| 17 | `DESIGN_SYSTEM.md` (root) | **Misplaced** | Belongs in `docs/` with all other technical documentation | Referenced in docs/README.md | Move to `docs/DESIGN_SYSTEM.md` | ✅ Zero |

---

## D. Files to Archive

| File | Current Location | Archive Destination | Reason |
|------|-----------------|--------------------|----|
| `State_District_Masters.xlsx` | `src/district-master/` | `.docs/archive/` | Original geo data source — no runtime use but historically valuable |
| `stateDistrictMaster.ts` | `apps/mobile/src/data/` | `.docs/archive/` | Legacy TS data file superseded by JSON — archive before delete to be safe |

---

## E. Files to Move

| File | From | To | Why |
|------|------|----|-----|
| `DESIGN_SYSTEM.md` | Root `/` | `docs/DESIGN_SYSTEM.md` | All technical docs live in `docs/` — this is the only one at root |

**Reference updates required after this move:**
- `docs/README.md` — update link to `DESIGN_SYSTEM.md` (remove `../`)
- `README.md` (root) — update any link that points to `./DESIGN_SYSTEM.md`

---

## F. Files to Keep (No Action Required)

| Item | Why |
|------|-----|
| `android/app/debug.keystore` | Required for all debug/dev builds by React Native |
| `apps/mobile/src/assets/logo/cm_fevicon_logo_trans.png` | Used by SplashScreen + OnboardingScreen |
| `apps/mobile/src/assets/obscreens/evob_1/2/3.png` | Used by OnboardingScreen |
| `apps/mobile/src/assets/splash_bg.png` | Used by SplashScreen, LoginScreen, RegisterScreen |
| `apps/mobile/src/data/stateDistrictMaster.json` | Canonical geo data — used by MyAccountScreen |
| `apps/mobile/src/data/evCatalog.json` | Used by AddVehicleScreen |
| `apps/mobile/src/services/mockData.ts` | Core mock data — used by multiple screens |
| `apps/mobile/src/services/walletData.ts` | Used by WalletTransactionsScreen |
| `apps/mobile/src/theme/typography.ts` | Used by 6+ components |
| `apps/mobile/src/theme/colors.ts` | Used across app |
| `docker/postgres/init.sql` | Required for Docker Compose PostgreSQL init |
| `docker-compose.yml` | Backend infrastructure definition |
| `.config/project.config.json` | Agent tooling config |
| `DEVELOPMENT_RULES.md` | Referenced by `GEMINI.md` |
| `GEMINI.md` | Agent rules entry point |
| `.docs/ChargeMesh_Legal_Documentation.md` | 48-section legal framework — retain for legal due diligence |
| All `.github/` files (except empty ISSUE_TEMPLATE/) | CI workflows, contribution guide, PR template |
| `packages/shared-types/index.ts` + `packages/shared-constants/index.ts` | Shared type/constant definitions |

---

## G. GitHub Exclusions Audit

| File / Pattern | In .gitignore? | Status |
|----------------|----------------|--------|
| `.env`, `.env.*` | ✅ Yes | Clean |
| `*.keystore`, `*.jks`, `*.p12`, `*.pem` | ✅ Yes | Clean |
| `node_modules/` | ✅ Yes | Clean |
| `apps/mobile/android/app/build/` | ✅ Yes | Clean |
| `apps/backend/dist/` | ✅ Yes | Clean |
| `packages/*/dist/` | ✅ Yes (added Phase C) | Clean |
| `*.tsbuildinfo` | ✅ Yes | Clean |
| `apps/mobile/android/keystore.properties` | ✅ Yes (added Phase C) | Clean |
| `*.apk`, `*.aab` | ✅ Yes | Clean |
| `apps/mobile/android/local.properties` | ✅ Yes | Clean |
| `docker-compose.override.yml` | ✅ Yes | Clean |
| `logs/`, `*.log` | ✅ Yes | Clean |
| `coverage/` | ✅ Yes | Clean |
| `*.DS_Store`, `Thumbs.db` | ✅ Yes | Clean |
| `src/` root directory | ❌ **Not excluded** | ⚠️ Should be deleted or gitignored |

> **Note:** The root `src/` (12 MB of duplicate images) is not gitignored and would be committed as-is to GitHub. Deletion is the cleanest fix.

---

## H. Code Quality Findings

### Naming Conventions
✅ **Fully consistent.** All files follow PascalCase for components/screens/contexts, camelCase for utilities. No inconsistent naming found. No renaming needed.

### Console Logs
✅ **Zero** `console.log` / `console.warn` / `console.debug` statements found in mobile source.

### TODO / FIXME Comments
✅ **Zero** actual TODOs found. One false positive (`xxxl` spacing token matched the regex).

### Dead Code
✅ No dead screens or components. All 22 screens are registered in navigation. All 20 components are referenced.

### Large Files — Flagged for Future Refactoring (Not Urgent)

| File | Size | Note |
|------|------|------|
| `MapScreen.tsx` | **128.7 KB** | Contains QR scanner, bottom sheet, map, filters, station list — future candidate to split |
| `MyAccountScreen.tsx` | 60.1 KB | Contains edit modals, address picker, state/district logic |
| `PaymentMethodsScreen.tsx` | 48.2 KB | Wallet + UPI + card + FASTag all in one file |
| `ActivityScreen.tsx` | 41.1 KB | Sessions + bookings + history |
| `mockData.ts` | 40.4 KB | Large data file — expected and acceptable |

> These are not blocking. App works correctly. Flagged for a future refactoring sprint only.

### Data Source Audit

| Dataset | Sources | Canonical | Action |
|---------|---------|-----------|--------|
| State/District geo | `stateDistrictMaster.json` ✅ + `stateDistrictMaster.ts` ❌ | `.json` | Remove `.ts` |
| EV vehicle catalog | `evCatalog.json` only | `.json` | None |
| Station/CPO data | `mockData.ts` only | `.ts` | None |
| Wallet data | `walletData.ts` only | `.ts` | None |
| Translations | `en.ts` + `hi.ts` | Both | None |

---

## I. Proposed Execution Plan

### Group 1 — Zero-Risk Build Artifacts
```
[ ] Delete apps/mobile/android/app/build/
[ ] Delete apps/backend/dist/
[ ] Delete packages/shared-types/dist/
[ ] Delete packages/shared-constants/dist/
[ ] Delete .github/ISSUE_TEMPLATE/   (empty dir)
[ ] Delete apps/mobile/tsconfig.tsbuildinfo
[ ] Delete apps/admin/tsconfig.tsbuildinfo
```

### Group 2 — Archive Then Delete
```
[ ] Copy src/district-master/State_District_Masters.xlsx → .docs/archive/
[ ] Copy apps/mobile/src/data/stateDistrictMaster.ts → .docs/archive/
[ ] Delete originals after archive copies confirmed
```

### Group 3 — Confirmed Root src/ Duplicates
```
[ ] Delete src/logo/        (5 files, exact copies)
[ ] Delete src/obscreens/   (3 files, exact copies)
[ ] Delete src/splash-ss/   (1 file, exact copy)
[ ] Delete now-empty src/ root directory
```

### Group 4 — File Move + Reference Updates
```
[ ] Move DESIGN_SYSTEM.md → docs/DESIGN_SYSTEM.md
[ ] Update docs/README.md link
[ ] Update root README.md link (if present)
```

### Group 5 — Unused Logo Assets (⚠️ Awaiting Q1 Answer)

**Q1:** These 4 logo files have zero imports in any mobile source file. What should I do?

| File | Size | Note |
|------|------|------|
| `cm_fevicon_logo.png` | 942 KB | Non-transparent version — transparent one is used |
| `cm_logo.png` | 780 KB | No usage found anywhere |
| `cm_web_logo.png` | 425 KB | Web asset — wrong directory |
| `cm_web_logo_trans.png` | 480 KB | Web asset — wrong directory |

- **Option A** — Remove all 4
- **Option B** — Keep `cm_fevicon_logo.png`, remove the other 3
- **Option C** — Keep all (no changes to logo folder)

---

## J. Estimated Space Recovery

| Group | Items | Recoverable |
|-------|-------|-------------|
| Group 1 — Build artifacts | 7 | ~500 KB+ (build/ may be larger) |
| Group 2 — Archive/ts file | 2 | ~61 KB |
| Group 3 — Root src/ duplicates | ~10 files | **~12.2 MB** |
| Group 4 — Move only | 1 | 0 |
| Group 5 — Unused logos (if approved) | 4 | ~2.6 MB |
| **Total** | | **~15.5 MB+** |

---

> **Groups 1–4 are ready to execute on your approval.**  
> **Group 5 requires your answer to Q1 first.**
