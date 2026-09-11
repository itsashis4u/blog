---
title: A practical startup budget for React Native apps
description: How I think about cold start, JS bundle weight, and the few measurements that actually change what you ship.
date: 2026-09-10
tags:
  - react-native
  - performance
layout: layouts/post.njk
---

Cold start is where React Native apps feel honest. Users do not care that your feature flag system is elegant if the first screen takes three seconds to paint.

This is the checklist I use when a React Native app feels slow on mid-range Android. It is deliberately short. Most “performance programs” die because they measure everything and change nothing.

### 1. Pick one device and one path

Pick a mid-range Android device (or an emulator profile that matches one). Time the path from process start to first interactive screen — usually login or home after a cold kill.

Write the number down. If you cannot reproduce it twice within ~10%, your instrumentation is the problem, not the app.

### 2. Separate native launch from JS work

A slow start is often two different problems:

- **Native shell:** splash, MainApplication init, early native modules
- **JS bundle:** parse + execute, then React mount + first fetch

Flipper, React Native’s performance monitor, and platform tools (Android Studio CPU profiler, Xcode Instruments) will disagree with each other. That is fine. You only need to know which bucket owns most of the delay.

If JS owns it, chasing native splash animations will not help. If native owns it, trimming Redux will not help.

### 3. Weigh the JS bundle before you rewrite features

Export a release bundle and look at size. Then look at *composition*:

- Giant icon packs imported wholesale
- Moment.js (or similar) pulled in for one format call
- Debug-only libraries that leaked into release
- Duplicate copies of the same utility across packages

Removing one accidental dependency often beats a week of memoization theater.

A useful habit: every new dependency must answer “what does this cost on the critical path?” If nobody can answer, it does not ship.

### 4. Defer work that is not needed for first paint

Common offenders on the first screen:

- Eager analytics SDKs
- Prefetching feeds the user has not asked for
- Hydrating large global stores before the route is known
- Running migrations or cache sweeps on every cold start

Move non-critical work after interaction, or behind `InteractionManager` / idle callbacks where it is safe. The goal is not zero work — it is **ordered** work.

### 5. Images and lists are still the usual suspects

If the first screen is image-heavy:

- Know your cache policy
- Avoid decoding huge assets for tiny thumbnails
- Prefer known dimensions so layout does not thrash

If the first screen is a list:

- Virtualize early
- Do not mount heavy row trees “just for now”
- Watch for synchronous storage reads inside row render

These are boring. They also show up in real traces constantly.

### 6. Make a budget, then defend it

Example budget for a consumer app on mid-range Android (adjust for your product):

- Cold start to first interactive screen: under **2.5s** on the reference device
- Release JS bundle: know the number; fail CI if it jumps more than a set % without review
- First screen network: one critical request, not five

A budget without a gate is a wish. Put the bundle size check in CI. Put the startup path on a weekly smoke test. Revisit the numbers when the product changes — not when someone feels anxious.

### What I ignore (until later)

- Micro-optimizing re-renders before you have a trace
- Rewriting navigation “for performance” without evidence
- Chasing 60fps polish on a screen that is still waiting on the network

Fix the critical path first. Everything else is garnish.

### Closing

Performance work is mostly taste and discipline: measure one path, name the bucket, cut weight, defer the rest, and put a gate on the budget. If you do that consistently, the app feels faster — and you stop arguing about vibes.
