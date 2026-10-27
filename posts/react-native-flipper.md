---
title: Better debugging in React Native apps with Flipper
description: How Flipper helps you inspect layouts, network calls, and Redux state faster.
date: 2021-02-19
updated: 2026-10-18
quickAnswer: "Flipper is a desktop platform for inspecting and debugging iOS and Android apps, with a layout inspector, network inspector, device logs, and a plugin API (including redux-flipper). On React Native 0.62 or newer it is included for new apps, and the SDK can be pinned to 0.76.0 in android/gradle.properties and the iOS Podfile."
tags:
  - react-native
  - flipper
layout: layouts/post.njk
marginalia:
  shipsWith:
    - Layout Inspector
    - Network
    - Databases
    - Images
    - Shared Preferences
    - Crash Reporter
  note: "If you use Redux in your application, you can install the Redux Flipper plugin. (For React Native 0.76+, prefer the built-in React Native DevTools.)"
  requires:
    - "react-native >= 0.62"
    - "flipper 0.76.0"
---
### What is Flipper?

Flipper is a desktop platform for inspecting and debugging mobile applications on iOS and Android. Built on [Electron](https://www.electronjs.org/), it combines a layout inspector, network inspector, and device log viewer under one roof. Its plugin API also lets you build custom tooling or pull in community plugins — for example, [redux-flipper](https://github.com/jk-gan/redux-flipper) for inspecting Redux actions and state diffs.

By default, Flipper ships with:

- Layout Inspector
- Network Inspector
- Databases
- Images
- Shared Preferences
- Crash Reporter
- React DevTools
- Metro Logs

### Setup

If you are starting a new app on React Native `0.62` or newer, Flipper comes wired up out of the box. To integrate it into an existing project (`>= 0.62`), follow the platform guides:

- **Android:** [Flipper React Native Android guide](https://fbflipper.com/docs/getting-started/react-native-android/)
- **iOS:** [Flipper React Native iOS guide](https://fbflipper.com/docs/getting-started/react-native-ios)

### Updating to the latest SDK version

The Flipper SDK version bundled with a given React Native release can lag behind the desktop client. Run `npm info flipper` to check the latest stable release, then update your native configs:

**Android (`android/gradle.properties`):**

```properties
FLIPPER_VERSION=0.76.0
```

Then run `./gradlew clean` inside your `android/` directory.

**iOS (`ios/Podfile`):**

```ruby
use_flipper!({ 'Flipper' => '0.76.0' })
```

Then run `pod install` inside `ios/` (or `npx pod-install` from the project root).

Flipper takes a lot of friction out of day-to-day React Native debugging — give it a spin.
