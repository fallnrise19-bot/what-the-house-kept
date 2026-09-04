from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0319.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

old = "A dark psychological story about survival, control, and a bond that refuses to fit neatly into either.<br>The closer freedom gets, the harder it becomes to tell what freedom is supposed to mean."
new = "Mira was abducted as a child and spent years being passed through a system built to train, condition, and sell people.<br>Beneath the Collar follows what happens when she reaches the Facility, where the rules change, and so does the person holding them."
if old not in text:
    raise SystemExit("Old Beneath the Collar blurb not found")
text = text.replace(old, new, 1)

if 'const BUILD_VERSION = "v0.3.19";' not in text:
    raise SystemExit("v0.3.19 build marker not found")
text = text.replace('const BUILD_VERSION = "v0.3.19";', 'const BUILD_VERSION = "v0.3.20";', 1)
game.write_text(text, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.19", "0.3.20").replace("sfx-v0319.js", "sfx-v0320.js")
index.write_text(i, encoding="utf-8")
old_sfx = assets / "sfx-v0319.js"
old_sfx.rename(assets / "sfx-v0320.js")

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 7", "versionCode 8").replace('versionName "0.3.19"', 'versionName "0.3.20"')
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.19.txt"
r = old_readme.read_text(encoding="utf-8").replace("v0.3.19", "v0.3.20")
r += "\nBeneath the Collar description updated to the author's exact approved wording.\n"
new_readme = OUT / "README-v0.3.20.txt"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

required = [
    'const BUILD_VERSION = "v0.3.20";',
    "Mira was abducted as a child and spent years being passed through a system built to train, condition, and sell people.",
    "Beneath the Collar follows what happens when she reaches the Facility, where the rules change, and so does the person holding them.",
    "Watchers", "Intensity", "Phantoms", "Odd Thomas",
    '"go back to bedroom"',
    "stares at the closed door",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.20 requirement: {needle}")

for forbidden in [
    "A dark psychological story about survival, control",
    "The closer freedom gets, the harder it becomes to tell what freedom is supposed to mean."
]:
    if forbidden in text:
        raise SystemExit(f"Old blurb text remains: {forbidden}")

if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")
if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")

print("Exact v0.3.20 Android project generated with approved Beneath the Collar blurb")
