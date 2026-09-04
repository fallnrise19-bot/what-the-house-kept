from pathlib import Path
import base64
import shutil
import textwrap

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "recovered" / "game-v0313.js"
OUT = ROOT / "android_project"

if not SOURCE.exists():
    raise SystemExit("Run tools/recover_v0313.py first")

source = SOURCE.read_text(encoding="utf-8")
source = source.replace('const BUILD_VERSION = "v0.3.13";', 'const BUILD_VERSION = "v0.3.14";', 1)

old_room_helpers = '''  function roomTitle(room) {
    return room === "ensuite" ? "Ensuite Bathroom" : "Master Bedroom";
  }

  function currentRoomDescriptionHtml() {
    return state.room === "ensuite"
      ? ensuiteDescriptionHtml()
      : bedroomDescriptionHtml();
  }
'''
new_room_helpers = '''  function roomTitle(room) {
    if (room === "ensuite") return "Ensuite Bathroom";
    if (room === "hall") return "Upstairs Hall";
    return "Master Bedroom";
  }

  function currentRoomDescriptionHtml() {
    if (state.room === "ensuite") return ensuiteDescriptionHtml();
    if (state.room === "hall") return hallDescriptionHtml();
    return bedroomDescriptionHtml();
  }

  function hallDescriptionHtml() {
    const f = state.flags;
    const bedroomDoorText = f.bedroomDoorOpen
      ? "The master-bedroom door stands open behind him."
      : "The master-bedroom door is closed behind him.";
    const lightText = f.flashlightHasFreshBatteries && hasItem("Emergency flashlight")
      ? "The repaired flashlight throws a narrow, steady beam along the corridor."
      : "The ceiling light is dead, and very little daylight reaches this part of the landing.";
    return `
      <p>Thomas stands just outside the master bedroom on the upstairs landing. ${bedroomDoorText} ${lightText}</p>
      <p>The corridor continues past the main bathroom and linen cupboard toward two closed bedroom doors. The staircase descends at the other end of the landing.</p>
      <p>From here the house sounds larger than it did inside the bedroom: old pipes, a faint tick from cooling wood, and the distant movement of air through rooms that have been shut too long.</p>
    `;
  }
'''
if old_room_helpers not in source:
    raise SystemExit("Room helper patch target not found")
source = source.replace(old_room_helpers, new_room_helpers, 1)

old_render_room = '''  function renderRoom() {
    roomNameEl.textContent = roomTitle(state.room);

    if (state.room === "bedroom") {
      renderBedroom();
    } else {
      renderEnsuite();
    }

    input.focus();
  }


  function renderBedroom() {
'''
new_render_room = '''  function renderRoom() {
    roomNameEl.textContent = roomTitle(state.room);

    if (state.room === "bedroom") {
      renderBedroom();
    } else if (state.room === "ensuite") {
      renderEnsuite();
    } else {
      renderHall();
    }

    input.focus();
  }

  function renderHall() {
    sceneEl.innerHTML = hallDescriptionHtml();
  }

  function renderBedroom() {
'''
if old_render_room not in source:
    raise SystemExit("Render-room patch target not found")
source = source.replace(old_render_room, new_render_room, 1)

old_route = '''    if (state.room === "bedroom") {
      bedroomCommand(q, raw);
    } else {
      ensuiteCommand(q, raw);
    }

    saveState();
  }

  function handleBedroomClock(q, raw) {
'''
new_route = '''    if (state.room === "bedroom") {
      bedroomCommand(q, raw);
    } else if (state.room === "ensuite") {
      ensuiteCommand(q, raw);
    } else {
      hallCommand(q, raw);
    }

    saveState();
  }

  function hallCommand(q, raw) {
    const f = state.flags;

    if (hasAny(q, ["return bedroom", "go bedroom", "go to bedroom", "enter bedroom", "back to bedroom", "open bedroom door", "open door"])) {
      f.bedroomDoorOpen = true;
      setRoom("bedroom");
      say("Thomas opens the bedroom door and steps back inside.", raw);
      return;
    }

    if (hasAny(q, ["look around", "look at hall", "look hallway", "examine hall", "examine hallway", "describe room"])) {
      say(hallDescriptionHtml().replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim(), raw);
      return;
    }

    if (hasAny(q, ["look at bedroom door", "look bedroom door", "check bedroom door", "examine bedroom door", "look at door"])) {
      const stateText = f.bedroomDoorOpen ? "It is open." : "It is closed.";
      say(`The master-bedroom door is old painted wood with a brass knob. ${stateText}`, raw);
      return;
    }

    if (hasAny(q, ["close bedroom door", "shut bedroom door", "close door", "shut door"])) {
      if (f.bedroomDoorOpen) {
        f.bedroomDoorOpen = false;
        say("Thomas closes the bedroom door from the hallway.", raw);
      } else {
        say("The bedroom door is already closed.", raw);
      }
      return;
    }

    if (hasAny(q, ["listen", "listen to house", "listen in hallway"])) {
      say("Thomas listens. A pipe settles somewhere below, followed by the faint movement of air through the landing. Nothing else distinguishes itself.", raw);
      return;
    }

    if (hasAny(q, ["go downstairs", "go down stairs", "descend stairs", "explore hallway", "go farther", "continue down hall"])) {
      if (!f.flashlightHasFreshBatteries || !hasItem("Emergency flashlight")) {
        say("The landing becomes too dark beyond the bedroom doorway for Thomas to move through it comfortably. He needs a working light before he explores farther.", raw);
      } else {
        say("The flashlight makes the corridor usable, but Thomas pauses at the landing. There are several rooms and the staircase ahead; he needs to choose where he is going rather than treating the entire floor as one action.", raw);
      }
      return;
    }

    if (hasAny(q, ["emma"])) {
      say("Thomas freezes at the name. Emma. He does not know why it feels as though he should recognize it. “Who?”", raw);
      return;
    }

    genericFallback(q, raw);
  }

  function handleBedroomClock(q, raw) {
'''
if old_route not in source:
    raise SystemExit("Command-route patch target not found")
source = source.replace(old_route, new_route, 1)

old_leave = '''    if (hasAny(q, ["leave bedroom", "open bedroom door", "go hall", "go hallway", "enter hallway", "open door"]) && !q.includes("bathroom")) {
      f.bedroomDoorOpen = true;
      f.hallSeen = true;
      if (f.flashlightHasFreshBatteries && hasItem("Emergency flashlight")) {
        say("Thomas opens the bedroom door. The upstairs hallway beyond it is considerably darker than the bedroom, and the ceiling light still does not respond. He switches on the repaired flashlight. Its beam reaches cleanly down the hall. For the first time this morning, the darkness is no longer a practical obstacle.", raw);
      } else {
        say("Thomas opens the bedroom door. The upstairs hallway beyond it is considerably darker than the bedroom. Very little daylight reaches it from the stairwell, and the ceiling light does not respond when he tries the switch beside the door. He can leave if he wants, but he will not be able to see much farther down the hall without some kind of light.", raw);
      }
      return;
    }
'''
new_leave = '''    if (hasAny(q, ["open bedroom door", "open door"]) && !hasAny(q, ["leave bedroom", "go hall", "go hallway", "enter hallway"]) && !q.includes("bathroom")) {
      if (f.bedroomDoorOpen) {
        say("The bedroom door is already open to the dark upstairs hallway.", raw);
      } else {
        f.bedroomDoorOpen = true;
        f.hallSeen = true;
        if (f.flashlightHasFreshBatteries && hasItem("Emergency flashlight")) {
          say("Thomas opens the bedroom door. The upstairs hallway beyond it is considerably darker than the bedroom, and the ceiling light still does not respond. He switches on the repaired flashlight. Its beam reaches cleanly down the hall.", raw);
        } else {
          say("Thomas opens the bedroom door. The upstairs hallway beyond it is considerably darker than the bedroom. Very little daylight reaches it from the stairwell, and the ceiling light does not respond when he tries the switch beside the door.", raw);
        }
      }
      return;
    }

    if (hasAny(q, ["leave bedroom", "go hall", "go hallway", "enter hallway", "step into hallway", "step out of bedroom"]) && !q.includes("bathroom")) {
      f.bedroomDoorOpen = true;
      f.hallSeen = true;
      const doorSlams = f.windowOpen;
      if (doorSlams) f.bedroomDoorOpen = false;
      state.room = "hall";
      saveState();
      renderRoom();

      if (doorSlams) {
        window.__WTHK_SFX__?.playDoorSlam();
        say("Thomas steps into the hallway. The change in pressure catches the open bedroom window behind him, and the bedroom door slams shut with a crack sharp enough to make him flinch. Cold air moving through the room is the obvious explanation. He stands still for another second anyway.", raw);
      } else if (f.flashlightHasFreshBatteries && hasItem("Emergency flashlight")) {
        say("Thomas steps into the upstairs hallway and switches on the repaired flashlight. Its beam reaches cleanly down the corridor. For the first time this morning, the darkness is no longer a practical obstacle.", raw);
      } else {
        say("Thomas steps into the upstairs hallway. Very little daylight reaches it from the stairwell, and the ceiling light does not respond. He can make out the landing and the bedroom door behind him, but not much farther without a working light.", raw);
      }
      return;
    }
'''
if old_leave not in source:
    raise SystemExit("Bedroom-to-hall patch target not found")
source = source.replace(old_leave, new_leave, 1)

# Build folder from scratch.
if OUT.exists():
    shutil.rmtree(OUT)
assets = OUT / "app" / "src" / "main" / "assets" / "game"
java_dir = OUT / "app" / "src" / "main" / "java" / "com" / "creativepixels" / "whatthehousekept"
assets_audio = assets / "audio"
assets_images = assets / "images"
for path in [assets_audio, assets_images, java_dir]:
    path.mkdir(parents=True, exist_ok=True)

(assets / "game.js").write_text(source, encoding="utf-8")
shutil.copy2(ROOT / "styles.css", assets / "styles.css")
shutil.copy2(ROOT / "tools" / "assets" / "bedroom-door-slam.mp3", assets_audio / "bedroom-door-slam.mp3")

music_parts = [
    ROOT / "audio-loop-runtime" / "v0.3.12" / f"one-last-morning-loop.part0{i}.b64"
    for i in range(1, 5)
]
music_bytes = base64.b64decode("".join(p.read_text(encoding="utf-8").strip() for p in music_parts))
(assets_audio / "one-last-morning-loop.mp3").write_bytes(music_bytes)
(assets_images / ".keep").write_text("", encoding="utf-8")

index_html = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#151411" />
  <title>What the House Kept</title>
  <link rel="stylesheet" href="styles.css?v=0.3.14" />
</head>
<body>
  <main class="app-shell">
    <section class="game" aria-label="What the House Kept">
      <header class="topbar">
        <div><div class="game-title">WHAT THE HOUSE KEPT</div><div id="roomName" class="room-name">Master Bedroom</div></div>
        <div class="chapter">Chapter One · v0.3.14</div>
      </header>
      <section id="scene" class="scene" aria-live="polite"><p class="system-note">Loading prototype…</p></section>
      <form id="commandForm" class="command-bar">
        <input id="commandInput" type="text" autocomplete="off" autocapitalize="sentences" spellcheck="true" aria-label="What do you do?" placeholder="What do you do?" />
        <button class="submit-button" type="submit" aria-label="Do action">›</button>
      </form>
      <div id="parserNote" class="parser-note">Type naturally. The game understands more than one way of saying most things.</div>
      <section id="drawer" class="drawer" aria-live="polite"><div class="drawer-head"><h2 id="drawerTitle">Inventory</h2><button id="drawerClose" type="button" class="icon-button" aria-label="Close">×</button></div><div id="drawerBody"></div></section>
      <nav class="bottom-nav" aria-label="Game controls"><button type="button" data-panel="room">Room</button><button type="button" data-panel="inventory">Inventory</button><button type="button" data-panel="journal">Journal</button><button type="button" data-panel="settings">Settings</button></nav>
    </section>
  </main>
  <script src="music-v0313.js?v=0.3.14"></script>
  <script src="sfx-v0314.js?v=0.3.14"></script>
  <script src="game.js?v=0.3.14"></script>
</body>
</html>
'''
(assets / "index.html").write_text(index_html, encoding="utf-8")

music_js = r'''(() => {
  "use strict";
  const SAVE_KEY = "wthk-starter-v0.3.3";
  const TARGET_VOLUME = 0.07;
  const FADE_SECONDS = 1.6;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioContext = AudioContextClass ? new AudioContextClass() : null;
  const gain = audioContext ? audioContext.createGain() : null;
  if (gain && audioContext) {
    gain.gain.value = 0;
    gain.connect(audioContext.destination);
  }

  let musicBuffer = null;
  let source = null;
  let sourceStartedAt = 0;
  let sourceOffset = 0;

  function musicSettingOn() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      return saved?.settings?.music !== false;
    } catch (_) {
      return true;
    }
  }

  function inOpeningSuite() {
    const room = (document.getElementById("roomName")?.textContent || "").trim().toLowerCase();
    return room === "master bedroom" || room === "ensuite bathroom" || room === "upstairs hall";
  }

  function stopSource() {
    if (!source || !audioContext) return;
    try {
      const elapsed = Math.max(0, audioContext.currentTime - sourceStartedAt);
      if (musicBuffer?.duration) sourceOffset = (sourceOffset + elapsed) % musicBuffer.duration;
      source.stop();
    } catch (_) {}
    try { source.disconnect(); } catch (_) {}
    source = null;
  }

  function setGain(target, immediate = false) {
    if (!gain || !audioContext) return;
    const now = audioContext.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    if (immediate) gain.gain.setValueAtTime(target, now);
    else gain.gain.linearRampToValueAtTime(target, now + FADE_SECONDS);
  }

  function startSource() {
    if (!audioContext || !gain || !musicBuffer || source) return;
    const next = audioContext.createBufferSource();
    next.buffer = musicBuffer;
    next.loop = true;
    next.connect(gain);
    const offset = musicBuffer.duration ? sourceOffset % musicBuffer.duration : 0;
    next.start(0, offset);
    sourceStartedAt = audioContext.currentTime;
    source = next;
  }

  async function syncMusic({ immediateOff = false } = {}) {
    if (!audioContext || !gain) return;
    const shouldPlay = musicBuffer && musicSettingOn() && inOpeningSuite();
    if (!shouldPlay) {
      if (immediateOff || !musicSettingOn()) {
        setGain(0, true);
        stopSource();
      } else if (source) {
        setGain(0, false);
        window.setTimeout(() => {
          if (!musicSettingOn() || !inOpeningSuite()) stopSource();
        }, Math.ceil(FADE_SECONDS * 1000) + 80);
      }
      return;
    }
    if (audioContext.state !== "running") {
      try { await audioContext.resume(); } catch (_) { return; }
    }
    startSource();
    setGain(TARGET_VOLUME, false);
  }

  async function activateAudio() {
    if (audioContext && audioContext.state !== "running") {
      try { await audioContext.resume(); } catch (_) {}
    }
    syncMusic();
  }

  document.addEventListener("pointerdown", activateAudio, { capture: true, passive: true });
  document.addEventListener("keydown", activateAudio, { capture: true });
  document.addEventListener("touchstart", activateAudio, { capture: true, passive: true });
  document.addEventListener("click", event => {
    const musicButton = event.target.closest?.('[data-setting="music"]');
    setTimeout(() => syncMusic({ immediateOff: !!musicButton && !musicSettingOn() }), 0);
  });
  document.addEventListener("submit", () => setTimeout(() => syncMusic(), 0));

  const roomName = document.getElementById("roomName");
  if (roomName) new MutationObserver(() => syncMusic()).observe(roomName, { childList: true, subtree: true, characterData: true });

  if (audioContext) {
    fetch("audio/one-last-morning-loop.mp3", { cache: "no-store" })
      .then(response => {
        if (!response.ok) throw new Error("Could not load opening music");
        return response.arrayBuffer();
      })
      .then(data => audioContext.decodeAudioData(data))
      .then(buffer => {
        musicBuffer = buffer;
        syncMusic();
      })
      .catch(error => console.error("Opening music failed:", error));
  }

  window.__WTHK_AUDIO__ = { sync: syncMusic, targetVolume: TARGET_VOLUME };
})();
'''
(assets / "music-v0313.js").write_text(music_js, encoding="utf-8")

sfx_js = r'''(() => {
  "use strict";
  const SAVE_KEY = "wthk-starter-v0.3.3";
  const DOOR_SLAM_VOLUME = 0.05;
  const doorSlam = new Audio("audio/bedroom-door-slam.mp3");
  doorSlam.preload = "auto";
  doorSlam.volume = DOOR_SLAM_VOLUME;
  doorSlam.load();

  function soundSettingOn() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      return saved?.settings?.ambient !== false;
    } catch (_) {
      return true;
    }
  }

  async function playDoorSlam() {
    if (!soundSettingOn()) return;
    try {
      doorSlam.pause();
      doorSlam.currentTime = 0;
      doorSlam.volume = DOOR_SLAM_VOLUME;
      await doorSlam.play();
    } catch (error) {
      console.warn("Door-slam sound could not play:", error);
    }
  }

  window.__WTHK_SFX__ = {
    playDoorSlam,
    doorSlamVolume: DOOR_SLAM_VOLUME,
    get soundSettingOn() { return soundSettingOn(); }
  };
})();
'''
(assets / "sfx-v0314.js").write_text(sfx_js, encoding="utf-8")

(OUT / "settings.gradle").write_text('''pluginManagement {\n    repositories { google(); mavenCentral(); gradlePluginPortal() }\n}\ndependencyResolutionManagement {\n    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)\n    repositories { google(); mavenCentral() }\n}\nrootProject.name = "WhatTheHouseKept"\ninclude(":app")\n''', encoding="utf-8")

(OUT / "build.gradle").write_text('''plugins {\n    id "com.android.application" version "8.9.1" apply false\n}\n''', encoding="utf-8")

(OUT / "gradle.properties").write_text('''org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.nonTransitiveRClass=true\n''', encoding="utf-8")

app_dir = OUT / "app"
app_dir.mkdir(parents=True, exist_ok=True)
(app_dir / "build.gradle").write_text('''plugins {\n    id "com.android.application"\n}\n\nandroid {\n    namespace "com.creativepixels.whatthehousekept"\n    compileSdk 36\n\n    defaultConfig {\n        applicationId "com.creativepixels.whatthehousekept"\n        minSdk 26\n        targetSdk 36\n        versionCode 2\n        versionName "0.3.14"\n    }\n\n    buildTypes {\n        debug {\n            applicationIdSuffix ".debug"\n            versionNameSuffix "-debug"\n            debuggable true\n        }\n        release {\n            minifyEnabled false\n            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"\n        }\n    }\n\n    buildFeatures {\n        buildConfig true\n    }\n\n    compileOptions {\n        sourceCompatibility JavaVersion.VERSION_17\n        targetCompatibility JavaVersion.VERSION_17\n    }\n}\n\ndependencies {\n    implementation "androidx.webkit:webkit:1.17.0"\n}\n''', encoding="utf-8")
(app_dir / "proguard-rules.pro").write_text("", encoding="utf-8")

manifest_dir = app_dir / "src" / "main"
(manifest_dir / "AndroidManifest.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application\n        android:allowBackup="false"\n        android:label="What the House Kept"\n        android:supportsRtl="true"\n        android:theme="@android:style/Theme.Material.NoActionBar"\n        android:usesCleartextTraffic="false">\n        <activity\n            android:name=".MainActivity"\n            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|smallestScreenSize|uiMode"\n            android:exported="true"\n            android:screenOrientation="portrait">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN" />\n                <category android:name="android.intent.category.LAUNCHER" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>\n''', encoding="utf-8")

main_activity = r'''package com.creativepixels.whatthehousekept;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.OnBackPressedCallback;
import androidx.webkit.WebViewAssetLoader;

public final class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(15, 14, 12));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);

        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
            webView.clearCache(true);
            settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        } else {
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        }

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
        });

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });

        webView.loadUrl("https://appassets.androidplatform.net/assets/game/index.html");
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
'''
# Activity.OnBackPressedDispatcher is ComponentActivity-only; use a platform-safe override instead.
main_activity = main_activity.replace('import androidx.activity.OnBackPressedCallback;\n', '')
start = main_activity.index('        getOnBackPressedDispatcher().addCallback')
end = main_activity.index('        webView.loadUrl', start)
main_activity = main_activity[:start] + main_activity[end:]
main_activity = main_activity.replace(
    '    @Override\n    protected void onDestroy()',
    '    @Override\n    public void onBackPressed() {\n        if (webView != null && webView.canGoBack()) webView.goBack();\n        else super.onBackPressed();\n    }\n\n    @Override\n    protected void onDestroy()'
)
(java_dir / "MainActivity.java").write_text(main_activity, encoding="utf-8")

readme = '''WHAT THE HOUSE KEPT — ANDROID v0.3.14 DOOR-SLAM BUILD\n\nBuild configuration:\n- Android Gradle Plugin 8.9.1\n- Gradle 8.11.1\n- Gradle JVM 21\n- Java compatibility 17\n- minSdk 26 / compileSdk 36 / targetSdk 36\n\nDoor-slam behavior:\n- Thomas must leave the Master Bedroom and enter the Upstairs Hall.\n- The bedroom window must be open.\n- The bedroom door closes as a persistent physical state.\n- bedroom-door-slam.mp3 plays once at 5% volume for that transition.\n- The Ambient setting controls the sound.\n- Reopening the door and recreating the same physical conditions can produce another slam.\n\nOpen this project from a short Windows path such as C:\\WTHK and keep Gradle on JVM 21.\n'''
(OUT / "README-DOOR-SLAM.txt").write_text(readme, encoding="utf-8")

# Static verification before Gradle is involved.
checks = {
    "v0.3.14 build marker": 'const BUILD_VERSION = "v0.3.14";',
    "hall room title": 'return "Upstairs Hall";',
    "open-window condition": 'const doorSlams = f.windowOpen;',
    "persistent closed door": 'if (doorSlams) f.bedroomDoorOpen = false;',
    "sound trigger": 'window.__WTHK_SFX__?.playDoorSlam();',
}
for name, needle in checks.items():
    if needle not in source:
        raise SystemExit(f"Static verification failed: {name}")

print("Android v0.3.14 project generated successfully")
