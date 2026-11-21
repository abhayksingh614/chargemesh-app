# ChargeMesh — Secret & Credential Management Policy

**Classification:** Security Architecture Standard  
**Target Workspaces:** `apps/backend`, `apps/mobile`, `apps/admin`, `packages/*`, `.github/workflows`  

---

## 1. Principles of Secret Management

1. **Zero Secret Persistence in Version Control:** No production passwords, private keys, JWT secrets, database connection strings, payment gateway keys, or SMS gateway tokens may ever be committed to Git.
2. **Environment Isolation:** Secrets are injected strictly at runtime via environment variables or managed secrets engines (e.g. AWS Secrets Manager, GitHub Actions Secrets).
3. **Fail-Closed Startup Validation:** Applications must validate configuration upon boot and terminate immediately if essential secrets are missing or insecure in production.
4. **Least-Privilege Token Scoping:** All service accounts, API tokens, and database roles must possess only the minimum permissions necessary for their function.

---

## 2. Configuration & Local Development

### 2.1 The `.env.example` Template Standard
Every workspace maintains an `.env.example` file:
- All variable names must match those expected by the application code.
- Values must be explicit placeholders (e.g. `your_razorpay_key_id_here`).
- No live production credentials or real private keys may appear in example files.

### 2.2 Gitignore Enforcement
[`.gitignore`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.gitignore) comprehensively excludes:
```gitignore
.env
.env.*
!.env.example
!.env.*.example
*.pem
*.key
*.p12
*.jks
*.keystore
secrets/
.secrets/
apps/mobile/android/keystore.properties
```

---

## 3. Automated Secret Scanning

### 3.1 GitHub Actions Continuous Scanning
[`.github/workflows/security-scan.yml`](file:///c:/Users/aksde/Videos/My_Codex/Chargemesh_app/.github/workflows/security-scan.yml) runs on every push and pull request targeting `prod` and `beta`:
```bash
grep -rnE "(AKIA[0-9A-Z]{16}|rzp_live_[a-zA-Z0-9]+|-----BEGIN [A-Z ]*PRIVATE KEY-----)" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=.next \
  --exclude-dir=reports \
  --exclude-dir=docs \
  --exclude-dir=build \
  --exclude-dir=.gradle \
  .
```
If any credential signature is detected, the workflow fails immediately, blocking merge to `beta` and `prod`.

---

## 4. Secret Revocation & Emergency Rotation Runbook

If a credential or private key is accidentally committed or suspected of compromise:

1. **Immediate Revocation:**
   - Log into the corresponding service provider (AWS, Razorpay, SMS gateway, PostgreSQL).
   - Immediately revoke and invalidate the compromised key.
2. **Rotate and Re-deploy:**
   - Generate a new, high-entropy secret.
   - Update production environment variables or secret vaults.
   - Restart affected application pods or services.
3. **Git History Scrubbing:**
   - Use `git-filter-repo` or BFG Repo-Cleaner to purge the sensitive commit from history if not yet pushed to public remotes.
   - *Note: Once pushed to a public remote, consider the secret compromised permanently and rotate it immediately.*
4. **Audit Logs Review:**
   - Inspect API access logs, database query records, and payment webhooks for anomalous activity during the exposure window.
