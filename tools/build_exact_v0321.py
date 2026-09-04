from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

# Build the verified v0.3.20 base first.
subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0320.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

anchor = '''  function bedroomCommand(q, raw) {
    const f = state.flags;

'''
insert = '''  function bedroomCommand(q, raw) {
    const f = state.flags;

    // v0.3.21 final bedroom parser audit. These are natural-language aliases
    // and context repairs from the Drive interaction bank, not new puzzle logic.
    if (q === "look") q = "look around";
    if (q === "leave") q = "leave bedroom";
    if (q === "go into hall" || q === "go into hallway") q = "go hall";
    if (q === "look behind drawer") q = "look behind table";
    if (q === "look closely at photo" || q === "look closely at photograph") q = "look at cut edge";
    if (q === "yank curtains") q = "pull curtains down";
    if (q === "pull case off pillow") q = "remove pillowcase";

    // A direct self-harm request is always a hard refusal, regardless of object fallback ordering.
    if (hasAny(q, ["hurt self", "punch self", "hit self"])) {
      say("Thomas refuses. Absolutely not.", raw);
      return;
    }

    // Album-specific commands must win before the loose-photograph parser sees the word 'photo'.
    if (hasAny(q, ["count missing photos", "count missing photographs", "look at photo corners", "look at photograph corners", "check photo corners", "examine photo corners"])) {
      f.photoAlbumSeen = true;
      f.photoAlbumGapsSeen = true;
      state.focus = "photoAlbum";
      say("Thomas looks more carefully at the empty spaces in the album. Several sets of adhesive corners remain where photographs were removed. The gaps cluster within roughly the same stretch of years. There are no captions to explain what used to be there.", raw);
      return;
    }

    // The empty frame is a persistent handled object. Removing it should not erase context
    // before OPEN FRAME or LOOK AT BACK is entered as a separate command.
    if (hasAny(q, ["remove empty frame", "take empty frame down", "lift empty frame from wall", "take frame down"])) {
      f.frameRemoved = true;
      f.emptyFrameExamined = true;
      state.focus = "emptyFrame";
      say("Thomas lifts the empty frame from the wall. A faint cleaner rectangle remains where the wallpaper was protected from light. Nothing is hidden behind it.", raw);
      return;
    }

    if ((q === "open frame" || q === "open the frame") && (f.frameRemoved || f.emptyFrameExamined || state.focus === "emptyFrame")) {
      f.frameOpened = true;
      f.emptyFrameExamined = true;
      state.focus = "emptyFrame";
      say("Thomas bends back the small metal tabs and loosens the cardboard backing. There is still no photograph inside.", raw);
      return;
    }

    if (hasAny(q, ["look at back", "check back", "examine back"]) && (f.frameRemoved || f.frameOpened || state.focus === "emptyFrame")) {
      f.emptyFrameExamined = true;
      f.emptyFrameBackChecked = true;
      state.focus = "emptyFrame";
      say("On the cardboard backing, a date has been written lightly in pencil. It is from five years ago. Nothing else is marked there.", raw);
      return;
    }

    // Once the player has already examined the door scratches, a bare GET CLOSER
    // should preserve that conversational focus instead of demanding the noun again.
    if (q === "get closer" && f.scratchesExamined) {
      state.focus = "scratches";
      f.scratchesMeasured = true;
      if (f.clinicalNoteRead) {
        say("Thomas crouches closer to the scratches. They sit unusually low on the door, low enough that the phrase ‘female child’ from the hospital paperwork returns unpleasantly to mind. He dismisses the association almost at once.", raw);
      } else {
        say("Thomas crouches closer to the scratches. They sit unusually low on the door, a little more than two feet above the floor. Probably damage from furniture, shoes, or something carried through the doorway.", raw);
      }
      return;
    }

'''
if anchor not in text:
    raise SystemExit("bedroomCommand anchor not found")
text = text.replace(anchor, insert, 1)

# Make ordinary scratch inspection establish focus for follow-up commands like GET CLOSER.
old_scratch = '''    if (hasAny(q, ["touch scratches", "feel scratches", "run fingers over scratches"])) {
      say("Thomas runs a fingertip across the damaged paint. The exposed wood beneath it has smoothed with age. The scratches are not recent.", raw);
      return true;
    }
'''
new_scratch = '''    if (hasAny(q, ["touch scratches", "feel scratches", "run fingers over scratches"])) {
      state.focus = "scratches";
      say("Thomas runs a fingertip across the damaged paint. The exposed wood beneath it has smoothed with age. The scratches are not recent.", raw);
      return true;
    }
'''
if old_scratch in text:
    text = text.replace(old_scratch, new_scratch, 1)

# Version bump while preserving the existing save key and all v0.3.20 content.
if 'const BUILD_VERSION = "v0.3.20";' not in text:
    raise SystemExit("v0.3.20 build marker not found")
text = text.replace('const BUILD_VERSION = "v0.3.20";', 'const BUILD_VERSION = "v0.3.21";', 1)
game.write_text(text, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.20", "0.3.21").replace("sfx-v0320.js", "sfx-v0321.js")
index.write_text(i, encoding="utf-8")
old_sfx = assets / "sfx-v0320.js"
old_sfx.rename(assets / "sfx-v0321.js")

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 8", "versionCode 9").replace('versionName "0.3.20"', 'versionName "0.3.21"')
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.20.txt"
r = old_readme.read_text(encoding="utf-8").replace("v0.3.20", "v0.3.21")
r += "\nFinal Master Bedroom parser audit: repaired natural LOOK/LEAVE/hall aliases, drawer/photo/frame context, scratches follow-up, photo-album missing-photo commands, curtain/pillowcase aliases, and hard self-harm refusal.\n"
new_readme = OUT / "README-v0.3.21.txt"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

required = [
    'const BUILD_VERSION = "v0.3.21";',
    'if (q === "look") q = "look around";',
    'if (q === "leave") q = "leave bedroom";',
    'q === "go into hall"',
    'q === "look behind drawer"',
    'q === "look closely at photo"',
    'q === "yank curtains"',
    'q === "pull case off pillow"',
    '"count missing photos"',
    '"look at photo corners"',
    '"remove empty frame"',
    'q === "open frame"',
    'q === "get closer" && f.scratchesExamined',
    '"hurt self"',
    "Mira was abducted as a child and spent years being passed through a system built to train, condition, and sell people.",
    "Beneath the Collar follows what happens when she reaches the Facility, where the rules change, and so does the person holding them.",
    "Watchers", "Intensity", "Phantoms", "Odd Thomas",
    '"go back to bedroom"',
    "stares at the closed door",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.21 requirement: {needle}")

for forbidden in [
    "A dark psychological story about survival, control",
    "The closer freedom gets, the harder it becomes to tell what freedom is supposed to mean."
]:
    if forbidden in text:
        raise SystemExit(f"Forbidden old text remains: {forbidden}")

if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")
if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")

print("Exact v0.3.21 Android project generated with final Master Bedroom parser audit fixes")
