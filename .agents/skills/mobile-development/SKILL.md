---
name: mobile-development
description: >-
  Guidelines, patterns, and component architecture for developing and maintaining
  the React Native cross-platform driver application in apps/mobile.
---

# Chargemesh Mobile Development Skill

This skill provides patterns, architecture guidelines, and standards for the React Native driver application (`apps/mobile`).

## 1. Directory Structure

```text
apps/mobile/src/
├── components/       # Reusable UI primitives (Buttons, Badges, Cards, Modals)
├── navigation/       # React Navigation stack & tab navigators
├── screens/          # Screen components (Home, Map, QRScanner, LiveCharging, etc.)
├── services/         # API clients, WebSocket telemetry, mock data
├── theme/            # Design tokens (colors, typography, spacing, shadows)
└── utils/            # Helper functions and formatters
```

## 2. UI & Design System Guidelines

- **Theme Consistency**: Import colors and spacing from `@theme` / `src/theme/theme.ts`. Never hardcode raw hex colors or arbitrary paddings.
- **Micro-Interactions**: Use smooth feedback on touchables (haptic feedback, active opacity, animated state transitions).
- **Responsive Layout**: Use flexbox layouts that scale gracefully across iOS and Android screen sizes and safe areas.
- **Accessibility**: Include `accessibilityLabel` and `accessibilityRole` on interactive buttons and inputs.

## 3. Screen Development Pattern

When creating or modifying screens:
1. Define TypeScript navigation prop types in `src/navigation/types.ts`.
2. Extract sub-components into `src/components/` if reused across multiple screens.
3. Keep business logic and state management separated from rendering (use custom hooks or service layer).
4. Provide fallback loading and empty states for asynchronous operations.

## 4. Local Testing & Verification

```bash
# In apps/mobile
npm run lint
npm run test
npm run start # Start Metro bundler
```
