---
name: frontend
description: "Frontend playbook. Use when implementing React, Next.js App Router, Expo Router, or testing with Playwright. Choose configuration from user prompt."
---

# frontend (Playbook)

React, Next.js, Expo, and web testing. **Choose one configuration** from the user prompt.

## When to use (triggers)
- React components, state, accessibility → **react**
- Next.js App Router, RSC, data fetching → **next-app-router**
- Expo, Expo Router, native/web → **expo-router**
- E2E, Playwright, UI behavior → **playwright**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| React, component, state, a11y | react |
| Next.js, App Router, RSC, SSR | next-app-router |
| Expo, Expo Router, mobile | expo-router |
| Playwright, E2E, UI test | playwright |

## Configurations

### react
Design (states: loading/empty/error/success; a11y; data boundaries) → Implement (composition, small components, semantic HTML) → Verify (tests, a11y check). No hidden side effects in render; stable list keys; use code skill for TS.

### next-app-router
RSC vs client; routing; data fetching/caching; SEO/metadata. Verify behavior; use code skill for TS.

### expo-router
Routing; native vs web; builds; data fetching. Verify on target platforms.

### playwright
E2E testing; recon-then-action; flaky tests; verified behavior.
