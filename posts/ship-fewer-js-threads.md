---
title: Ship fewer JS threads — a React Native interaction budget
description: How I keep tap-to-response snappy on mid-range Android without rewriting the whole app.
date: 2026-09-12
tags:
  - react-native
  - performance
  - javascript
layout: layouts/post.njk
marginalia:
  shipsWith:
    - InteractionManager
    - FlashList / FlatList tuning
    - Hermes
  note: "Measure first on a mid-range device; flagships hide jank."
  requires:
    - "react-native >= 0.70"
---

Users forgive a slow cold start more than a laggy tap. After the first screen, every interaction is a promise: press → feedback within ~100ms, content within a few hundred.

## Pick one number

On a mid-range Android (or an emulator profile that matches one), time **tap → first paint of the next UI**. Do it for your worst navigation: open a heavy list, open a modal with a form, switch tabs that each mount a stack.

Write the number down. That is the interaction budget. Everything else is negotiation.

## Three buckets (again)

Same mental model as startup, different owners:

1. **JS work on the critical path** — parsing, sorting, Redux selectors, big JSON.
2. **Bridge / native layout** — too many shadow-tree updates, measure passes.
3. **List & image cost** — mounting 200 rows, decoding huge bitmaps on the UI thread.

You do not need perfect attribution. You need to know which bucket owns most of the delay on *your* worst path.

## Cheap wins that usually move the needle

- **Defer non-visible work** with `InteractionManager.runAfterInteractions` (or a microtask queue you control) so the press animation and route transition finish first.
- **Don't block the press handler** on network. Optimistic UI or a skeleton beats a frozen button.
- **Lists:** fixed `getItemLayout` when you can, smaller row components, avoid anonymous inline functions that defeat memo, and prefer a virtualized list that matches your RN version (FlashList when it fits).
- **Hermes + production minify** for release measurements; Debug JS is a different sport.
- **Images:** correct size, caching, and avoid decoding 4k assets for a 96px avatar.

## What I ignore early

Micro-optimizing re-renders of a leaf label while a 2MB JSON parse sits on the press path. Flamecharts lie less than gut feel — capture one interaction, fix the fattest frame, remeasure.

## Done looks like

Same mid-range device, same path, a lower number you would show a PM. If it did not move, you optimized the wrong bucket — pick another and try again.
