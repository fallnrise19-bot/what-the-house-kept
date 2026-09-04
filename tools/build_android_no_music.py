from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
subprocess.run(["python3", str(ROOT / "tools" / "recover_v0313.py")], check=True, cwd=ROOT)
subprocess.run(["python3", str(ROOT / "tools" / "build_android_door_slam.py")], check=True, cwd=ROOT)

project = ROOT / "android_project"
assets = project / "app" / "src" / "main" / "assets" / "game"

# Remove opening music completely, rather than merely disabling playback.
for path in [
    assets / "music-v0313.js",
    assets / "audio" / "one-last-morning-loop.mp3",
]:
    if path.exists():
        path.unlink()

index = (assets / "index.html").read_text(encoding="utf-8")
index = index.replace('  <script src="music-v0313.js?v=0.3.14"></script>\n', '')
index = index.replace('v=0.3.14', 'v=0.3.15')
index = index.replace('Chapter One · v0.3.14', 'Chapter One · v0.3.15')
(assets / "index.html").write_text(index, encoding="utf-8")

game = (assets / "game.js").read_text(encoding="utf-8")
game = game.replace('const BUILD_VERSION = "v0.3.14";', 'const BUILD_VERSION = "v0.3.15";', 1)
(assets / "game.js").write_text(game, encoding="utf-8")

build_gradle = (project / "app" / "build.gradle").read_text(encoding="utf-8")
build_gradle = build_gradle.replace('versionCode 2', 'versionCode 3', 1)
build_gradle = build_gradle.replace('versionName "0.3.14"', 'versionName "0.3.15"', 1)
(project / "app" / "build.gradle").write_text(build_gradle, encoding="utf-8")

readme = project / "README-DOOR-SLAM.txt"
text = readme.read_text(encoding="utf-8")
text = text.replace('v0.3.14', 'v0.3.15')
text += '\nOpening music: REMOVED from this build. No music controller or music MP3 is bundled.\n'
readme.write_text(text, encoding="utf-8")

# Strong verification: the app package source must contain no opening-music asset/controller.
assert not (assets / "music-v0313.js").exists()
assert not (assets / "audio" / "one-last-morning-loop.mp3").exists()
assert 'music-v0313.js' not in (assets / "index.html").read_text(encoding="utf-8")
assert (assets / "audio" / "bedroom-door-slam.mp3").exists()
assert 'const DOOR_SLAM_VOLUME = 0.05;' in (assets / "sfx-v0314.js").read_text(encoding="utf-8")
assert 'const BUILD_VERSION = "v0.3.15";' in (assets / "game.js").read_text(encoding="utf-8")

print('Android v0.3.15 no-music project generated successfully')
