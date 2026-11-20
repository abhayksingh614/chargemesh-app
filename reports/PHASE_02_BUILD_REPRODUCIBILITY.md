# PHASE 02 BUILD REPRODUCIBILITY REPORT
**Project:** ChargeMesh  
**Finding ID:** `BUILD-002`  
**Date:** 2026-11-20  
**Status:** RESOLVED & VERIFIED  

---

## 1. Problem Definition & Root Cause

Prior to this remediation, running `npm run build:admin` in fresh clean environments frequently failed with React context resolution errors:
```
TypeError: Cannot read properties of null (reading 'useContext')
    at StyleRegistry
```

### Root Cause Analysis
1. `apps/mobile/package.json` pins `"react": "18.2.0"`.
2. `apps/admin/package.json` declared `"react": "^18.2.0"` and `"react-dom": "^18.2.0"`, which allowed npm to resolve `18.3.1` for the admin portal.
3. During npm workspace hoisting, `react@18.2.0` was hoisted to the monorepo root, while `apps/admin/node_modules/` maintained `react@18.3.1`.
4. As a result, Next.js App Router and `styled-jsx` resolved disparate CommonJS instances of React across workspace boundaries, causing null context references during static site generation.

---

## 2. Permanent Architectural Solution

To guarantee 100% build reproducibility across CI/CD, Docker, and developer environments without requiring manual copying of `node_modules`:

1. **Strict Dependency Pinning:**
   In `apps/admin/package.json`:
   ```json
   "dependencies": {
     "react": "18.2.0",
     "react-dom": "18.2.0",
     "styled-jsx": "^5.1.1"
   },
   "devDependencies": {
     "@types/react": "^18.3.0",
     "@types/react-dom": "^18.3.0"
   }
   ```
2. **Monorepo-Wide Overrides:**
   In the root `package.json`:
   ```json
   "overrides": {
     "react": "18.2.0",
     "react-dom": "18.2.0"
   }
   ```
3. **Lockfile Deduplication:**
   Cleaned nested `apps/admin/node_modules/react` and `react-dom` references in `package-lock.json` so that npm hoists a single, shared copy of React 18.2.0 for the entire monorepo.
4. **Next.js Transpilation Configuration:**
   Maintained in `apps/admin/next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     transpilePackages: ['@chargemesh/shared-types', '@chargemesh/shared-constants'],
   };
   module.exports = nextConfig;
   ```

---

## 3. Independent Verification Evidence

### Dependency Tree Verification
```bash
$ npm ls react react-dom styled-jsx
chargemesh@1.0.0
+-- @chargemesh/admin@1.0.0 -> .\apps\admin
| +-- next@14.2.35
| | +-- react-dom@18.2.0 deduped
| | +-- react@18.2.0 deduped
| | `-- styled-jsx@5.1.1 deduped
| +-- react-dom@18.2.0 overridden
| | `-- react@18.2.0 deduped
| +-- react@18.2.0 overridden
| `-- styled-jsx@5.1.1
|   `-- react@18.2.0 deduped
`-- @chargemesh/mobile@1.0.0 -> .\apps\mobile
  +-- react@18.2.0 deduped
```
**Result:** 0 invalid packages, 0 duplicates, exit code 0.

### Next.js Production Build Verification
```bash
$ npm run build:admin
  ▲ Next.js 14.2.35
   Creating an optimized production build ...
   ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   ✓ Generating static pages (19/19)
   Finalizing page optimization ...
   Collecting build traces ...
Route (app)                               Size     First Load JS
... 17 app routes prerendered
Route (pages)
┌ ○ /404                                  630 B          84.1 kB
└ ○ /500                                  640 B          84.1 kB
```
**Result:** Build passed with exit code 0 across 19 static routes.
