# ChargeMesh Support & Community Resources

Thank you for building with ChargeMesh! Whether you are integrating charging stations, deploying the operations portal, or developing features on the driver mobile app, here is how to get support.

---

## 1. Documentation First

Before raising an issue, review our extensive technical documentation in [`docs/`](docs/):

- **Architecture & System Design:** [`docs/architecture/`](docs/architecture/)
- **API & CSMS Documentation:** [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)
- **Database Models & PostGIS:** [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md)
- **Local Development & Testing:** [`TESTING.md`](TESTING.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md)
- **Screens & Navigation Directory:** [`docs/SCREENS_AND_NAVIGATION.md`](docs/SCREENS_AND_NAVIGATION.md)
- **CPO & EV Compatibility Audit:** [`docs/CPO_AND_EV_COMPATIBILITY_AUDIT.md`](docs/CPO_AND_EV_COMPATIBILITY_AUDIT.md)

---

## 2. GitHub Discussions & Community Q&A

For general questions, architectural inquiries, ideas, and troubleshooting:

👉 **[GitHub Discussions](https://github.com/abhayksingh614/chargemesh-app/discussions)**

- **Q&A Category:** Ask for help with local setup, emulator configurations, or backend errors.
- **Ideas Category:** Propose new CPO protocol adapters or mobile UX improvements.
- **Show and Tell:** Share your local testbeds or custom hardware integrations.

---

## 3. Reporting Issues

If you encounter an unexpected behavior or bug:

- Check existing [GitHub Issues](https://github.com/abhayksingh614/chargemesh-app/issues) to avoid duplicates.
- Submit a bug report using our [Bug Report Form](.github/ISSUE_TEMPLATE/bug_report.yml).
- For security vulnerabilities, follow the [Security Policy](SECURITY.md) (do not post publicly).

---

## 4. Frequently Asked Questions (FAQ)

### Q: Why does the mobile app currently run in mock mode?
**A:** The mobile client is designed with a local-first architecture (`apps/mobile/src/services/mockData.ts`) to enable rapid offline development, UI testing, and Play Store pre-release validation without requiring a live cloud backend or physical charging hardware. Connecting the mobile REST hooks to the NestJS backend is planned for Phase 2.

### Q: Does ChargeMesh support OCPP 1.6 and OCPP 2.0.1?
**A:** Yes! The backend CSMS gateway (`apps/backend/src/modules/ocpp`) includes WebSocket protocol handlers for both OCPP 1.6-J and 2.0.1 message types, including `BootNotification`, `StatusNotification`, `StartTransaction`, `StopTransaction`, and real-time `MeterValues`.

### Q: How do I test the mobile app on Android?
**A:** Run `npm run dev:mobile` in one terminal, then run `npm run android --workspace=apps/mobile` in another terminal. Ensure you have an Android device or emulator running Android API 34 with USB debugging enabled.

---

## 5. Contact Maintainers

- **Project Lead:** Abhay Kumar Singh ([@abhayksingh614](https://github.com/abhayksingh614))
- **Email:** [support@chargemesh.in](mailto:support@chargemesh.in)
- **Repository:** [https://github.com/abhayksingh614/chargemesh-app](https://github.com/abhayksingh614/chargemesh-app)
