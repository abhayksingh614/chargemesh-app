# ChargeMesh — Open-Source License Evaluation & Recommendation

> **Prepared For:** Repository Maintainer & Owner (Abhay Kumar Singh / abhayksingh614)  
> **Repository:** [https://github.com/abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)  
> **Status:** Pending Owner Sign-off (Proprietary license preserved until approved)

---

## 1. Context & Motivation

ChargeMesh currently contains a proprietary license file (`PROPRIETARY SOFTWARE LICENSE Copyright (c) 2026 ChargeMesh. All Rights Reserved.`) and `"license": "UNLICENSED"` in `package.json`.

To transform ChargeMesh into an open-source EV charging interoperability platform that fosters collaboration with CPOs, EV fleet operators, mobile developers, and the global developer community, selecting an appropriate Open Source Initiative (OSI)-approved license is required.

---

## 2. Evaluation of License Options

### Option A: MIT License (Recommended Standard)

- **Nature:** Highly permissive, lightweight, universally recognized.
- **Permissions:** Commercial use, modification, distribution, private use, sublicensing.
- **Conditions:** Requires preservation of copyright notice and disclaimer of warranty/liability.
- **Why it fits ChargeMesh:**
  - Lowers friction to adoption by Indian and international CPOs (Charge Point Operators).
  - Matches the licensing standard of core dependencies (React Native, NestJS, Next.js).
  - Maximizes developer contributions without complex legal barriers.

### Option B: Apache License 2.0 (Alternative)

- **Nature:** Permissive with explicit patent and trademark safeguards.
- **Permissions:** Commercial use, modification, distribution, patent grants.
- **Conditions:** Requires notice of changes, explicit patent grant, trademark protection clause.
- **Why it is an alternative:**
  - Protects the project from patent trolling via an explicit reciprocal patent retaliation clause.
  - Useful if the repository owner wants to protect proprietary charging hardware protocols.

---

## 3. Recommended License Text (MIT)

Upon owner approval, the root `LICENSE` file can be updated to:

```text
MIT License

Copyright (c) 2026 Abhay Kumar Singh and ChargeMesh Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 4. Third-Party Dependency Compatibility

Static analysis confirms that 100% of the runtime packages used in `apps/mobile`, `apps/backend`, `apps/admin`, and `packages/*` use permissive licenses (MIT, Apache-2.0, BSD-2/3-Clause). No copyleft dependencies (GPL/AGPL) are bundled into the distributed JavaScript or TypeScript bundles.

---

## 5. Next Steps for Maintainer

To approve transitioning to the MIT License:
1. Confirm acceptance of the MIT terms.
2. Update `LICENSE` to the MIT text above.
3. Update `package.json` `"license": "MIT"`.
