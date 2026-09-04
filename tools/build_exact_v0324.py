from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

# Build the verified v0.3.23 base first.
subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0323.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

# Explicit save-state defaults. Older saves remain compatible because missing flags are simply falsey.
if '      bathroomVisited: false,\n' not in text:
    raise SystemExit("bathroomVisited flag anchor missing")
text = text.replace(
    '      bathroomVisited: false,\n',
    '      bathroomVisited: false,\n      ensuiteDoorTried: false,\n      ensuiteDoorFreed: false,\n',
    1,
)

anchor = '''  function bedroomCommand(q, raw) {\n    const f = state.flags;\n\n'''
insert = '''  function bedroomCommand(q, raw) {\n    const f = state.flags;\n\n    // v0.3.24 ensuite entry nuisance: the private bathroom is not locked,\n    // but its old painted door initially sticks in the swollen frame.\n    // Once freed, it stays freed for the rest of the save.\n    const ensuiteDoorMentioned = hasAny(q, ["ensuite door", "bathroom door"]);\n    const ensuiteDoorLook = ensuiteDoorMentioned && hasAny(q, ["look", "examine", "inspect", "check", "study"]);\n    const ensuiteEntryIntent =\n      hasAny(q, [\n        "enter bathroom", "go bathroom", "go to bathroom", "go into bathroom",\n        "walk into bathroom", "step into bathroom",\n        "enter ensuite", "go ensuite", "go to ensuite", "go into ensuite",\n        "walk into ensuite", "step into ensuite",\n        "open ensuite", "open ensuite door", "open bathroom door"\n      ]) || q === "bathroom door" || q === "ensuite door";\n\n    const explicitEnsuiteForce = hasAny(q, [\n      "push bathroom door", "push ensuite door",\n      "pull bathroom door", "pull ensuite door",\n      "shove bathroom door", "shove ensuite door",\n      "jiggle bathroom door", "jiggle ensuite door",\n      "force bathroom door", "force ensuite door",\n      "kick bathroom door", "kick ensuite door",\n      "lean into bathroom door", "lean into ensuite door",\n      "shoulder bathroom door", "shoulder ensuite door",\n      "ram bathroom door", "ram ensuite door",\n      "try bathroom door again", "try ensuite door again"\n    ]);\n\n    const contextualEnsuiteForce =\n      f.ensuiteDoorTried && state.focus === "ensuiteDoor" &&\n      hasAny(q, [\n        "push door", "pull door", "shove door", "jiggle door", "force door",\n        "kick door", "lean into door", "shoulder door", "ram door",\n        "try door again", "try again"\n      ]);\n\n    if (ensuiteDoorLook) {\n      state.focus = "ensuiteDoor";\n      if (f.ensuiteDoorFreed) {\n        say("The narrow ensuite door sits beside the wardrobe. It opens normally now. Whatever had swollen the painted frame enough to catch it has already been persuaded to stop.", raw);\n      } else if (f.ensuiteDoorTried) {\n        say("The narrow ensuite door is not locked. The handle turns, but the painted edge is caught tightly against the swollen frame.", raw);\n      } else {\n        say("The narrow ensuite door sits beside the wardrobe. It is closed. The painted edge looks slightly swollen where it meets the frame, the sort of minor old-house problem Thomas would normally ignore until it became his problem.", raw);\n      }\n      return;\n    }\n\n    if (hasAny(q, [\n      "unlock bathroom door", "unlock ensuite door",\n      "use key on bathroom door", "use key on ensuite door",\n      "use brass key on bathroom door", "use brass key on ensuite door"\n    ])) {\n      f.ensuiteDoorTried = true;\n      state.focus = "ensuiteDoor";\n      say("The ensuite door is not locked. The handle turns perfectly well. The door itself is simply caught in the swollen frame.", raw);\n      return;\n    }\n\n    if (!f.ensuiteDoorFreed && (explicitEnsuiteForce || contextualEnsuiteForce)) {\n      f.ensuiteDoorTried = true;\n      f.ensuiteDoorFreed = true;\n      f.bathroomVisited = true;\n      const kicked = hasAny(q, ["kick bathroom door", "kick ensuite door", "kick door"]);\n      setRoom("ensuite");\n      if (kicked) {\n        say("Thomas kicks the bottom of the door. It opens immediately. He stares at it for a second. \\"Good. Mature.\\" He steps into the ensuite.", raw);\n      } else {\n        say("Thomas puts more weight into the stubborn door. The painted edge drags against the frame, then pops free hard enough to send him half a step forward into the bathroom. \\"There.\\" Apparently home maintenance has begun.", raw);\n      }\n      state.focus = null;\n      return;\n    }\n\n    if (ensuiteEntryIntent) {\n      if (f.ensuiteDoorFreed) {\n        f.bathroomVisited = true;\n        setRoom("ensuite");\n      } else {\n        f.ensuiteDoorTried = true;\n        state.focus = "ensuiteDoor";\n        say("Thomas turns the handle. The door gives about half an inch and catches against the frame. \\"Of course it does.\\"", raw);\n      }\n      return;\n    }\n\n'''
if anchor not in text:
    raise SystemExit("bedroomCommand anchor missing")
text = text.replace(anchor, insert, 1)

# Version bump while preserving the same save key and all previous room work.
if 'const BUILD_VERSION = "v0.3.23";' not in text:
    raise SystemExit("v0.3.23 build marker missing")
text = text.replace('const BUILD_VERSION = "v0.3.23";', 'const BUILD_VERSION = "v0.3.24";', 1)
game.write_text(text, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.23", "0.3.24").replace("sfx-v0323.js", "sfx-v0324.js")
index.write_text(i, encoding="utf-8")
old_sfx = assets / "sfx-v0323.js"
new_sfx = assets / "sfx-v0324.js"
if old_sfx.exists():
    old_sfx.rename(new_sfx)
elif not new_sfx.exists():
    raise SystemExit("Expected v0.3.23 SFX controller missing")

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 11", "versionCode 12").replace('versionName "0.3.23"', 'versionName "0.3.24"')
if 'versionCode 12' not in g or 'versionName "0.3.24"' not in g:
    raise SystemExit("Android version bump failed")
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.23.txt"
new_readme = OUT / "README-v0.3.24.txt"
if not old_readme.exists():
    raise SystemExit("v0.3.23 README missing")
r = old_readme.read_text(encoding="utf-8").replace("v0.3.23", "v0.3.24")
r += "\nv0.3.24 adds the sticky old-house ensuite door. It is never locked: the first ordinary entry attempt catches in the swollen frame, and natural physical commands free it permanently. KICK DOOR gets Thomas's sarcastic response.\n"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

required = [
    'const BUILD_VERSION = "v0.3.24";',
    'ensuiteDoorTried: false',
    'ensuiteDoorFreed: false',
    '"go into bathroom"',
    '"push bathroom door"',
    '"kick bathroom door"',
    '"try door again"',
    '"unlock bathroom door"',
    'door gives about half an inch',
    'Good. Mature.',
    'Bernard is still a plunger',
    'Mira was abducted as a child and spent years being passed through a system built to train, condition, and sell people.',
    'Watchers', 'Intensity', 'Phantoms', 'Odd Thomas',
    'stares at the closed door',
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.24 requirement: {needle}")

if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")
if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")

print("Exact v0.3.24 Android project generated with sticky ensuite door")
