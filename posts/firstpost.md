---
title: Better debugging react native apps with Flipper
description: How Flipper helps you debug issues with your app faster
date: 2021-02-19
tags:
  - react-native
  - flipper
layout: layouts/post.njk
---
### What is Flipper?
Flipper is a great platform to inspect and debug mobile applications written in ios and android. This developer tool is written in [electron](https://www.electronjs.org/). It is useful in inspecting layout, comes with a network inspector and device log viewer. It has also a plugin API which means you can extend the functionalities by creating your own plugins or using existing ones from the internet.
For example, if you use redux in your application, you can install [Redux Flipper](https://github.com/jk-gan/redux-flipper) plugin.

By default, Flipper provides these plugins:
- Layout Inspector
- Network
- Databases
- Images
- Shared Preferences
- Crash Reporter
- React DevTools
- Metro Logs

### Set up
If you are starting a new app using react native v0.62 and above, Flipper is available out of the box.
If you want to integrate with an existing project (>= v0.62), follow the steps:
Android:
https://fbflipper.com/docs/getting-started/react-native-android/

iOS:
https://fbflipper.com/docs/getting-started/react-native-ios


### Updating to latest SDK version
By default, the version of Flipper shipped with react native init maybe outdated. To verify you are on the latest version, run `npm info flipper` to determine the latest stable version.

To update to the latest SDK, follow the steps:

Android:
- Bump the FLIPPER_VERSION variable in android/gradle.properties, for example: FLIPPER_VERSION=0.76.0
- Run ./gradlew clean in the android directory.

iOS:
- Call use_flipper with a specific version in ios/Podfile, for example: use_flipper!({ 'Flipper' => '0.76.0' }).
- Run `pod install` in the ios directory or `npx pod-install` in your project root.


Flipper will make your life easier as a react native developer. Do try it.
