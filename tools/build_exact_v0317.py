from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "recovered-v0315" / "game-v0315.js"
OUT = ROOT / "android-exact-v0317"

if not SOURCE.exists():
    raise SystemExit("Run tools/recover_exact_v0315.py first")

source = SOURCE.read_text(encoding="utf-8")
if 'const BUILD_VERSION = "v0.3.15";' not in source:
    raise SystemExit("Expected exact v0.3.15 source marker not found")
source = source.replace('const BUILD_VERSION = "v0.3.15";', 'const BUILD_VERSION = "v0.3.17";', 1)

old = '''    if (hasAny(q, ["leave bedroom", "go hall", "go hallway", "enter hallway", "step into hall", "step into hallway"])) {
      f.bedroomDoorOpen = true;
      f.hallSeen = true;
      if (f.flashlightHasFreshBatteries && hasItem("Emergency flashlight")) f.flashlightOn = true;
      setRoom("hall");
      return;
    }
'''
new = '''    if (hasAny(q, ["leave bedroom", "go hall", "go hallway", "enter hallway", "step into hall", "step into hallway"])) {
      f.bedroomDoorOpen = true;
      f.hallSeen = true;
      if (f.flashlightHasFreshBatteries && hasItem("Emergency flashlight")) f.flashlightOn = true;
      const doorSlams = f.windowOpen;
      if (doorSlams) f.bedroomDoorOpen = false;
      setRoom("hall");
      if (doorSlams) {
        window.__WTHK_SFX__?.playDoorSlam();
        say("The open bedroom window catches the change in pressure as Thomas steps into the hall. Behind him, the bedroom door slams shut hard enough to make him flinch. \"Jesus Christ.\" He looks back at the door, then toward the open bedroom window. \"Right. Window.\"", raw);
      }
      return;
    }
'''
if old not in source:
    raise SystemExit("Exact v0.3.15 bedroom-to-hall transition was not found")
source = source.replace(old, new, 1)

if OUT.exists():
    shutil.rmtree(OUT)
assets = OUT / "app" / "src" / "main" / "assets" / "game"
audio = assets / "audio"
images = assets / "images"
java = OUT / "app" / "src" / "main" / "java" / "com" / "creativepixels" / "whatthehousekept"
for p in (audio, images, java):
    p.mkdir(parents=True, exist_ok=True)

(assets / "game.js").write_text(source, encoding="utf-8")
shutil.copy2(ROOT / "styles.css", assets / "styles.css")
shutil.copy2(ROOT / "tools" / "assets" / "bedroom-door-slam.mp3", audio / "bedroom-door-slam.mp3")
(images / ".keep").write_text("", encoding="utf-8")

(assets / "index.html").write_text('''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#151411" />
  <title>What the House Kept</title>
  <link rel="stylesheet" href="styles.css?v=0.3.17" />
</head>
<body>
  <main class="app-shell">
    <section class="game" aria-label="What the House Kept">
      <header class="topbar">
        <div><div class="game-title">WHAT THE HOUSE KEPT</div><div id="roomName" class="room-name">Master Bedroom</div></div>
        <div class="chapter">Chapter One · v0.3.17</div>
      </header>
      <section id="scene" class="scene" aria-live="polite"></section>
      <form id="commandForm" class="command-bar">
        <input id="commandInput" type="text" autocomplete="off" autocapitalize="sentences" spellcheck="true" aria-label="What do you do?" placeholder="What do you do?" />
        <button class="submit-button" type="submit" aria-label="Do action">›</button>
      </form>
      <div id="parserNote" class="parser-note">Type naturally. The game understands more than one way of saying most things.</div>
      <section id="drawer" class="drawer" aria-live="polite"><div class="drawer-head"><h2 id="drawerTitle">Inventory</h2><button id="drawerClose" type="button" class="icon-button" aria-label="Close">×</button></div><div id="drawerBody"></div></section>
      <nav class="bottom-nav" aria-label="Game controls"><button type="button" data-panel="room">Room</button><button type="button" data-panel="inventory">Inventory</button><button type="button" data-panel="journal">Journal</button><button type="button" data-panel="settings">Settings</button></nav>
    </section>
  </main>
  <script src="sfx-v0317.js?v=0.3.17"></script>
  <script src="game.js?v=0.3.17"></script>
</body>
</html>
''', encoding="utf-8")

(assets / "sfx-v0317.js").write_text(r'''(() => {
  "use strict";
  const SAVE_KEY = "wthk-starter-v0.3.3";
  const DOOR_SLAM_VOLUME = 0.05;
  const slam = new Audio("audio/bedroom-door-slam.mp3");
  slam.preload = "auto";
  slam.volume = DOOR_SLAM_VOLUME;
  slam.load();

  function ambientOn() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      return saved?.settings?.ambient !== false;
    } catch (_) {
      return true;
    }
  }

  async function playDoorSlam() {
    if (!ambientOn()) return;
    try {
      slam.pause();
      slam.currentTime = 0;
      slam.volume = DOOR_SLAM_VOLUME;
      await slam.play();
    } catch (error) {
      console.warn("Door slam could not play:", error);
    }
  }

  window.__WTHK_SFX__ = { playDoorSlam, doorSlamVolume: DOOR_SLAM_VOLUME };
})();
''', encoding="utf-8")

(OUT / "settings.gradle").write_text('''pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }
rootProject.name = "WhatTheHouseKept"
include(":app")
''', encoding="utf-8")
(OUT / "build.gradle").write_text('''plugins { id "com.android.application" version "8.9.1" apply false }
''', encoding="utf-8")
(OUT / "gradle.properties").write_text('''org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
''', encoding="utf-8")

app = OUT / "app"
app.mkdir(parents=True, exist_ok=True)
(app / "build.gradle").write_text('''plugins { id "com.android.application" }
android {
    namespace "com.creativepixels.whatthehousekept"
    compileSdk 36
    defaultConfig {
        applicationId "com.creativepixels.whatthehousekept"
        minSdk 26
        targetSdk 36
        versionCode 5
        versionName "0.3.17"
    }
    buildTypes {
        debug { applicationIdSuffix ".debug"; versionNameSuffix "-debug"; debuggable true }
        release { minifyEnabled false; proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro" }
    }
    buildFeatures { buildConfig true }
    compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }
}
dependencies { implementation "androidx.webkit:webkit:1.17.0" }
''', encoding="utf-8")
(app / "proguard-rules.pro").write_text("", encoding="utf-8")

main = app / "src" / "main"
(main / "AndroidManifest.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:allowBackup="false" android:label="What the House Kept" android:supportsRtl="true" android:theme="@android:style/Theme.Material.NoActionBar" android:usesCleartextTraffic="false">
    <activity android:name=".MainActivity" android:configChanges="keyboard|keyboardHidden|orientation|screenSize|smallestScreenSize|uiMode" android:exported="true" android:screenOrientation="portrait">
      <intent-filter><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LAUNCHER" /></intent-filter>
    </activity>
  </application>
</manifest>
''', encoding="utf-8")

(java / "MainActivity.java").write_text(r'''package com.creativepixels.whatthehousekept;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.WebViewAssetLoader;

public final class MainActivity extends Activity {
    private WebView webView;
    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(15,14,12));
        setContentView(webView);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
            webView.clearCache(true);
            s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        }
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder().addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) { return loader.shouldInterceptRequest(request.getUrl()); }
        });
        webView.loadUrl("https://appassets.androidplatform.net/assets/game/index.html");
    }
    @Override public void onBackPressed() { if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() { if (webView != null) { webView.stopLoading(); webView.destroy(); webView = null; } super.onDestroy(); }
}
''', encoding="utf-8")

(OUT / "README-v0.3.17.txt").write_text('''What the House Kept v0.3.17
Base: exact v0.3.15 INTERACTIONS runtime.
Opening music: absent.
Door slam: bedroom window open + Thomas enters Upstairs Hall => bedroom door closes and slam SFX plays at 5% volume.
Thomas verbally reacts: "Jesus Christ." then, after identifying the cause, "Right. Window."
Ambient OFF suppresses the SFX.
Gradle 8.11.1 / JVM 21 / AGP 8.9.1 / compileSdk 36 / targetSdk 36 / minSdk 26.
''', encoding="utf-8")

required = [
    'emptyFrameExamined: false',
    'emptyFrameBackChecked: false',
    'floorPlanBedroomCompared: false',
    'hallLightSwitchChecked: false',
    'hallBulbChecked: false',
    'const doorSlams = f.windowOpen;',
    'window.__WTHK_SFX__?.playDoorSlam();',
    '\"Jesus Christ.\"',
    '\"Right. Window.\"',
]
for needle in required:
    if needle not in source:
        raise SystemExit(f"Missing required exact-source feature: {needle}")
if 'music-v0313.js' in (assets / 'index.html').read_text(encoding='utf-8'):
    raise SystemExit('Music controller unexpectedly referenced')
print('Exact v0.3.17 Android project generated from v0.3.15 INTERACTIONS')
