---
title: Better debugging React Native apps with Flipper
description: A practical setup and workflow for debugging React Native apps faster with Flipper.
date: 2021-02-19
lastUpdated: 2026-09-22
tags:
  - react-native
  - flipper
  - debugging
layout: layouts/post.njk
ogImage: /img/og-react-native-flipper.svg
ogImageAlt: "Flipper debugging workflow for React Native apps"
marginalia:
  shipsWith:
    - Layout Inspector
    - Network
    - Databases
    - Images
    - Shared Preferences
    - Crash Reporter
  note: "If you use redux in your application, you can install the Redux Flipper plugin."
  requires:
    - "react-native >= 0.62"
    - "flipper 0.76.0"
---
### What is Flipper?
Flipper is a desktop platform for inspecting and debugging mobile apps on iOS and Android. It is built with [Electron](https://www.electronjs.org/) and includes useful built-in tooling such as layout inspection, network inspection, and logs. It also has a plugin API, so you can extend it with custom plugins or community plugins.

For example, if you use Redux in your app, you can install the [Redux Flipper](https://github.com/jk-gan/redux-flipper) plugin.

By default, Flipper provides these plugins:
- Layout Inspector
- Network
- Databases
- Images
- Shared Preferences
- Crash Reporter
- React DevTools
- Metro Logs

### Setup
If you are starting a new app with React Native v0.62 or above, Flipper is available out of the box.

If you want to integrate Flipper into an existing project (>= v0.62), follow:
Android:
https://fbflipper.com/docs/getting-started/react-native-android/

iOS:
https://fbflipper.com/docs/getting-started/react-native-ios


### Update to the latest SDK version
The Flipper version bundled with React Native may be outdated. To check the latest stable release, run `npm info flipper`.

To update to the latest SDK, follow the steps:

Android:
- Bump the `FLIPPER_VERSION` variable in `android/gradle.properties`, for example: `FLIPPER_VERSION=0.76.0`
- Run `./gradlew clean` in the android directory.

iOS:
- Call `use_flipper` with a specific version in `ios/Podfile`, for example: `use_flipper!({ 'Flipper' => '0.76.0' })`.
- Run `pod install` in the ios directory or `npx pod-install` in your project root.


Flipper can dramatically shorten debugging loops in React Native projects. Start with the built-in plugins, then add workflow-specific plugins as your app grows.
