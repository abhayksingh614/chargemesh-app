# Security Policy

The ChargeMesh team and open-source contributors take the security and privacy of EV drivers, charging equipment, and infrastructure data seriously.

---

## 1. Supported Versions

Security patches and bug fixes are applied to the active development branches:

| Version / Branch | Supported | Notes |
| :--- | :--- | :--- |
| `develop` | ✅ Yes | Active development integration branch |
| `main` | ✅ Yes | Production-ready tagged releases |
| `< 1.0.0` releases | ❌ No | Please upgrade to the latest tagged release |

---

## 2. Reporting a Vulnerability

**Please do NOT file public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability, credential leak, authentication bypass, or potential exploit in ChargeMesh:

1. **Email Details:** Send an encrypted or confidential report to:  
   📧 **[security@chargemesh.in](mailto:security@chargemesh.in)**  
   *Cc:* **[abhayksingh614@gmail.com](mailto:abhayksingh614@gmail.com)**
2. **Subject Line:** `[SECURITY] ChargeMesh Vulnerability Report — <Brief Description>`
3. **Report Contents:**
   - Detailed description of the vulnerability.
   - Specific component or file affected (e.g. `apps/backend/src/modules/auth`, `apps/mobile/android`).
   - Step-by-step reproduction instructions or Proof of Concept (PoC).
   - Potential impact on drivers, charging hardware, or backend systems.
   - Any suggested mitigations.

---

## 3. Vulnerability Response Timeline

We commit to the following response schedule:

- **Acknowledgment:** Within **48 hours** of receiving your report.
- **Initial Triage & Assessment:** Within **7 calendar days**.
- **Fix & Patch Delivery:** Within **14 to 30 days**, depending on severity.
- **Coordinated Public Disclosure:** Once a fix is verified and deployed, a security advisory will be published with proper attribution to the finder.

---

## 4. Responsible Disclosure Guidelines

When investigating vulnerabilities:
- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of service.
- Do not exploit a security issue beyond the minimum required to prove the vulnerability exists.
- Give the maintainers reasonable time to remediate the issue before public disclosure.
- Do not access or modify data belonging to other users or physical charging equipment without explicit permission.

---

## 5. Security Best Practices for Contributors

- **Zero Secret Commits:** Never commit `.env` files, API keys, private keys, or keystores.
- **Dependency Auditing:** Regularly run `npm audit` and keep dependencies updated.
- **Input Validation:** Use NestJS `ValidationPipe` with strict DTOs for all network endpoints.
- **Sanitization:** Ensure error responses never leak database schemas, connection strings, or stack traces.
