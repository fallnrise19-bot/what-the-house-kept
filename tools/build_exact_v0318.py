from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE_BUILDER = ROOT / "tools" / "build_exact_v0317.py"
OUT = ROOT / "android-exact-v0317"

subprocess.run([sys.executable, str(BASE_BUILDER)], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

# Thomas can only see the closed door once it has slammed behind him.
if "Jesus Christ." not in text:
    raise SystemExit("Previous reaction text not found")
text = text.replace("Jesus Christ.", "Shit.", 1)

old_reaction = "He looks back at the door, then toward the open bedroom window."
new_reaction = "He turns sharply at the sound and stares at the closed door. A second later, the cause catches up with him."
if old_reaction not in text:
    raise SystemExit("Old physically inconsistent reaction not found")
text = text.replace(old_reaction, new_reaction, 1)

# The rendered hall description must reflect the persistent bedroom-door state.
hall_fixture_line = '<p>A ceiling light fixture hangs overhead. A wall switch sits beside the bedroom doorway. Neither shows obvious damage.</p>'
hall_door_line = '<p>${f.bedroomDoorOpen ? "The master bedroom door stands open behind Thomas." : "The master bedroom door is closed behind Thomas."}</p>'
if hall_fixture_line not in text:
    raise SystemExit("Hall fixture line not found")
text = text.replace(hall_fixture_line, hall_door_line + "\n      " + hall_fixture_line, 1)

# Hall-specific door and return parser support.
hall_anchor = '''  function hallCommand(q, raw) {
    const f = state.flags;
'''
hall_logic = '''  function hallCommand(q, raw) {
    const f = state.flags;

    if (hasAny(q, ["look at bedroom door", "look at master bedroom door", "look at door", "examine bedroom door", "examine master bedroom door", "examine door", "check bedroom door", "check master bedroom door", "check door"])) {
      say(f.bedroomDoorOpen ? "The master bedroom door is open." : "The master bedroom door is closed.", raw);
      return;
    }

    if (hasAny(q, ["open bedroom door", "open master bedroom door", "open master door", "open door", "reopen bedroom door", "reopen master bedroom door", "reopen door"])) {
      if (f.bedroomDoorOpen) {
        say("The master bedroom door is already open.", raw);
      } else {
        f.bedroomDoorOpen = true;
        saveState();
        say("Thomas opens the master bedroom door again. Cool air moves out from the room beyond.", raw);
      }
      return;
    }

    if (hasAny(q, ["close bedroom door", "close master bedroom door", "close master door", "close door", "shut bedroom door", "shut master bedroom door", "shut door"])) {
      if (!f.bedroomDoorOpen) {
        say("The master bedroom door is already closed.", raw);
      } else {
        f.bedroomDoorOpen = false;
        saveState();
        say("Thomas closes the master bedroom door.", raw);
      }
      return;
    }

    if (hasAny(q, ["go back", "go back to bedroom", "go back into bedroom", "back to bedroom", "back into bedroom", "return bedroom", "return to bedroom", "return to master bedroom", "go bedroom", "go to bedroom", "go into bedroom", "go master bedroom", "go to master bedroom", "go into master bedroom", "enter bedroom", "enter master bedroom", "step into bedroom", "step back into bedroom", "walk to bedroom", "walk into bedroom", "walk back to bedroom", "head back to bedroom", "head into bedroom", "leave hall", "leave hallway", "exit hall", "exit hallway"])) {
      if (!f.bedroomDoorOpen) f.bedroomDoorOpen = true;
      setRoom("bedroom");
      return;
    }
'''
if hall_anchor not in text:
    raise SystemExit("Hall command header not found")
text = text.replace(hall_anchor, hall_logic, 1)

# LOOK AROUND in the hall should agree with the rendered room description.
old_look = 'say("The upstairs landing is narrow and dark. A ceiling fixture hangs overhead, with a wall switch beside the master bedroom door. Several other doors continue along the hall, but weak daylight from the stairwell does little for the far end.", raw);'
new_look = 'say(`The upstairs landing is narrow and dark. ${f.bedroomDoorOpen ? "The master bedroom door stands open behind Thomas." : "The master bedroom door is closed behind Thomas."} A ceiling fixture hangs overhead, with a wall switch beside the bedroom doorway. Several other doors continue along the hall, but weak daylight from the stairwell does little for the far end.`, raw);'
if old_look not in text:
    raise SystemExit("Hall look-around response not found")
text = text.replace(old_look, new_look, 1)

# Version bump. Save key intentionally remains wthk-starter-v0.3.3.
if 'const BUILD_VERSION = "v0.3.17";' not in text:
    raise SystemExit("v0.3.17 build marker not found")
text = text.replace('const BUILD_VERSION = "v0.3.17";', 'const BUILD_VERSION = "v0.3.18";', 1)
game.write_text(text, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.17", "0.3.18").replace("sfx-v0317.js", "sfx-v0318.js")
index.write_text(i, encoding="utf-8")

old_sfx = assets / "sfx-v0317.js"
new_sfx = assets / "sfx-v0318.js"
old_sfx.rename(new_sfx)

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 5", "versionCode 6").replace('versionName "0.3.17"', 'versionName "0.3.18"')
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.17.txt"
r = old_readme.read_text(encoding="utf-8").replace("v0.3.17", "v0.3.18").replace("Jesus Christ.", "Shit.")
r += "\nHall return fix: door state is visible and natural OPEN/REOPEN/CLOSE/RETURN commands work from the hall. Returning to the bedroom automatically opens a closed bedroom door.\n"
new_readme = OUT / "README-v0.3.18.txt"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

# Build-time regression checks before Gradle is even invoked.
required = [
    'const BUILD_VERSION = "v0.3.18";',
    '"Shit."',
    "stares at the closed door",
    '"go back to bedroom"',
    '"walk back to bedroom"',
    '"open master bedroom door"',
    '"reopen door"',
    "The master bedroom door is closed behind Thomas.",
    "if (!f.bedroomDoorOpen) f.bedroomDoorOpen = true;",
    "emptyFrameBackChecked: false",
    "hallBulbChecked: false",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.18 requirement: {needle}")

for forbidden in ["toward the open bedroom window", "Jesus Christ."]:
    if forbidden in text:
        raise SystemExit(f"Forbidden old text remains: {forbidden}")

if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")
if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")

print("Exact v0.3.18 Android project generated with hall return and physical door-state fixes")
