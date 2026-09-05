from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

# Build the verified v0.3.25 base first.
subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0325.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

# Keep the existing reset logic, but make the reset itself fully clean for repeated parser testing.
old_reset = '''      if (confirm("Reset this prototype and erase its local save?")) {\n          state = initialState();\n          saveState();\n          closeDrawer();\n          renderRoom();\n        }\n'''
new_reset = '''      if (confirm("Reset this prototype and erase its local save?")) {\n          state = initialState();\n          history = [];\n          historyIndex = 0;\n          saveState();\n          closeDrawer();\n          renderRoom();\n          input.value = "";\n          input.focus();\n        }\n'''
if old_reset not in text:
    raise SystemExit("Reset prototype handler anchor missing")
text = text.replace(old_reset, new_reset, 1)

if 'const BUILD_VERSION = "v0.3.25";' not in text:
    raise SystemExit("v0.3.25 build marker missing")
text = text.replace('const BUILD_VERSION = "v0.3.25";', 'const BUILD_VERSION = "v0.3.26";', 1)
game.write_text(text, encoding="utf-8")

# Android WebView needs a WebChromeClient so JavaScript confirm() can be presented.
main = OUT / "app" / "src" / "main" / "java" / "com" / "creativepixels" / "whatthehousekept" / "MainActivity.java"
j = main.read_text(encoding="utf-8")
import_anchor = 'import android.webkit.WebViewClient;\n'
if 'import android.webkit.WebChromeClient;' not in j:
    if import_anchor not in j:
        raise SystemExit("WebViewClient import anchor missing")
    j = j.replace(import_anchor, 'import android.webkit.WebChromeClient;\n' + import_anchor, 1)

client_anchor = '        webView = new WebView(this);\n'
if 'webView.setWebChromeClient(new WebChromeClient());' not in j:
    if client_anchor not in j:
        raise SystemExit("WebView creation anchor missing")
    j = j.replace(client_anchor, client_anchor + '        webView.setWebChromeClient(new WebChromeClient());\n', 1)
main.write_text(j, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.25", "0.3.26").replace("sfx-v0325.js", "sfx-v0326.js")
index.write_text(i, encoding="utf-8")
old_sfx = assets / "sfx-v0325.js"
new_sfx = assets / "sfx-v0326.js"
if old_sfx.exists():
    old_sfx.rename(new_sfx)
elif not new_sfx.exists():
    raise SystemExit("Expected v0.3.25 SFX controller missing")

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 13", "versionCode 14").replace('versionName "0.3.25"', 'versionName "0.3.26"')
if 'versionCode 14' not in g or 'versionName "0.3.26"' not in g:
    raise SystemExit("Android version bump failed")
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.25.txt"
new_readme = OUT / "README-v0.3.26.txt"
if not old_readme.exists():
    raise SystemExit("v0.3.25 README missing")
r = old_readme.read_text(encoding="utf-8").replace("v0.3.25", "v0.3.26")
r += "\nv0.3.26 fixes Settings > Reset prototype in the Android WebView. A WebChromeClient now supports the existing JavaScript confirmation dialog, and confirmed reset clears game state plus command history before returning to a fresh Master Bedroom state.\n"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

required_game = [
    'const BUILD_VERSION = "v0.3.26";',
    'id="resetGame"',
    'confirm("Reset this prototype and erase its local save?")',
    'state = initialState();',
    'history = [];',
    'historyIndex = 0;',
    'drawerWorkedLoose: false',
    '"shake drawer"',
    'ensuiteDoorFreed: false',
    'Good. Mature.',
    'Bernard is still a plunger',
    'Mira was abducted as a child and spent years being passed through a system built to train, condition, and sell people.',
    'stares at the closed door',
]
for needle in required_game:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.26 requirement: {needle}")

required_java = [
    'import android.webkit.WebChromeClient;',
    'webView.setWebChromeClient(new WebChromeClient());',
    's.setJavaScriptEnabled(true);',
    's.setDomStorageEnabled(true);',
]
for needle in required_java:
    if needle not in j:
        raise SystemExit(f"Missing Android reset support: {needle}")

if 'wthk-starter-v0.3.3' not in text:
    raise SystemExit("Save key changed unexpectedly")
if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")
if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")

print("Exact v0.3.26 Android project generated with working Reset prototype confirmation")
