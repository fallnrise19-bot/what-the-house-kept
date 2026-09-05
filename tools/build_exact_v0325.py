from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

# Build the verified v0.3.24 base first.
subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0324.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

# Save-compatible state for the new non-destructive drawer route.
flag_anchor = '      drawerImpactAttempts: 0,\n'
if flag_anchor not in text:
    raise SystemExit("drawerImpactAttempts flag anchor missing")
text = text.replace(flag_anchor, flag_anchor + '      drawerWorkedLoose: false,\n', 1)

# INSPECT DRAWER should be a normal look synonym.
old_look = 'if (hasAny(q, ["look drawer", "look at drawer", "examine drawer", "check drawer", "study drawer"])) {'
new_look = 'if (hasAny(q, ["look drawer", "look at drawer", "examine drawer", "inspect drawer", "check drawer", "study drawer"])) {'
if old_look not in text:
    raise SystemExit("drawer look family anchor missing")
text = text.replace(old_look, new_look, 1)

# Add natural, non-destructive ways to work a jammed drawer loose.
normal_pull_anchor = '''    if (hasAny(q, ["open drawer", "pull drawer", "pull on drawer", "tug drawer", "tug on drawer"]) && !hasAny(q, ["harder"])) {\n'''
if normal_pull_anchor not in text:
    raise SystemExit("normal drawer pull anchor missing")

new_handlers = '''    if (hasAny(q, [\n      "shake drawer", "jiggle drawer", "wiggle drawer", "rock drawer",\n      "shake the drawer", "jiggle the drawer", "wiggle the drawer", "rock the drawer"\n    ])) {\n      if (f.drawerBroken) {\n        say("Thomas shakes the broken drawer once. It remains impressively broken.", raw);\n      } else if (f.drawerOpened) {\n        say("Thomas gives the open drawer a small side-to-side shake. It rattles on the runners. There is no longer anything to free.", raw);\n      } else {\n        f.drawerJammed = true;\n        f.drawerWorkedLoose = true;\n        say("Thomas grips the handle and works the drawer from side to side. It barely moves, but something behind it shifts with a soft scrape. The catch feels less solid now.", raw);\n      }\n      return;\n    }\n\n    if (hasAny(q, [\n      "lift drawer", "lift front of drawer", "lift drawer front",\n      "pull while lifting", "pull drawer while lifting", "lift and pull drawer",\n      "angle drawer", "tilt drawer",\n      "ease drawer open", "work drawer open", "open drawer carefully",\n      "pull gently", "pull drawer gently", "tug gently", "tug drawer gently"\n    ])) {\n      if (f.drawerBroken) {\n        say("The drawer is already broken free and lying on the floor. Careful technique has arrived too late.", raw);\n      } else if (f.drawerOpened) {\n        say("The drawer is already open.", raw);\n      } else {\n        f.drawerOpened = true;\n        f.drawerJammed = false;\n        f.drawerWorkedLoose = false;\n        say("Thomas changes the angle instead of adding more force, lifting the front slightly as he pulls. The obstruction catches once, then slips aside. The drawer slides open without breaking. Inside are several old receipts and a packet of tissues.", raw);\n      }\n      return;\n    }\n\n    if (hasAny(q, [\n      "push drawer in then pull", "push drawer in and pull",\n      "close drawer and try again", "push drawer closed and try again",\n      "push it in then pull", "close it and try again"\n    ])) {\n      if (f.drawerBroken) {\n        say("The drawer is already on the floor. There is no useful 'in' left to push it toward.", raw);\n      } else if (f.drawerOpened) {\n        say("The drawer is already open.", raw);\n      } else {\n        f.drawerOpened = true;\n        f.drawerJammed = false;\n        f.drawerWorkedLoose = false;\n        say("Thomas pushes the drawer fully closed, then pulls again while keeping a little upward pressure on the handle. Whatever was catching behind it shifts out of the way, and the drawer opens normally. Inside are several old receipts and a packet of tissues.", raw);\n      }\n      return;\n    }\n\n'''
text = text.replace(normal_pull_anchor, new_handlers + normal_pull_anchor, 1)

# If the player has already loosened the obstruction by shaking/jiggling, a normal pull should finish the job cleanly.
old_pull_body = '''      } else {\n        f.drawerJammed = true;\n        say("The drawer moves perhaps an inch before stopping abruptly. Thomas pulls again. Something behind it catches against the back of the table.", raw);\n      }\n      return;\n    }\n\n    if (hasAny(q, ["pull harder on drawer", "pull on drawer harder", "pull drawer harder", "pull harder drawer", "tug harder on drawer", "tug on drawer harder", "force drawer", "force drawer open"])) {\n'''
new_pull_body = '''      } else if (f.drawerWorkedLoose) {\n        f.drawerOpened = true;\n        f.drawerJammed = false;\n        f.drawerWorkedLoose = false;\n        say("Thomas pulls again. The obstruction catches for a moment, then slides aside with a soft scrape. The drawer opens cleanly. Inside are several old receipts and a packet of tissues.", raw);\n      } else {\n        f.drawerJammed = true;\n        say("The drawer moves perhaps an inch before stopping abruptly. Thomas pulls again. Something behind it catches against the back of the table.", raw);\n      }\n      return;\n    }\n\n    if (hasAny(q, ["pull harder on drawer", "pull on drawer harder", "pull drawer harder", "pull harder drawer", "tug harder on drawer", "tug on drawer harder", "force drawer", "force drawer open"])) {\n'''
if old_pull_body not in text:
    raise SystemExit("drawer pull body anchor missing")
text = text.replace(old_pull_body, new_pull_body, 1)

# Existing pry/coin/pen/unblock route already opens cleanly. Make sure working the drawer loose state clears there too.
old_pry = '''        f.drawerOpened = true;\n        f.drawerJammed = false;\n        say("Thomas works at the narrow opening until he finds the obstruction and shifts it aside. The drawer slides open. Inside are several old receipts, a packet of tissues and nothing remotely worth the effort.", raw);\n'''
new_pry = '''        f.drawerOpened = true;\n        f.drawerJammed = false;\n        f.drawerWorkedLoose = false;\n        say("Thomas works at the narrow opening until he finds the obstruction and shifts it aside. The drawer slides open. Inside are several old receipts, a packet of tissues and nothing remotely worth the effort.", raw);\n'''
if old_pry not in text:
    raise SystemExit("drawer pry route anchor missing")
text = text.replace(old_pry, new_pry, 1)

# Closing a partly jammed drawer also clears the temporary worked-loose state.
old_close = '''      } else if (f.drawerJammed) {\n        f.drawerJammed = false;\n        say("Thomas pushes the partly opened drawer back in. It closes without much resistance. Whatever catches it only becomes a problem when he tries to pull it out.", raw);\n'''
new_close = '''      } else if (f.drawerJammed) {\n        f.drawerJammed = false;\n        f.drawerWorkedLoose = false;\n        say("Thomas pushes the partly opened drawer back in. It closes without much resistance. Whatever catches it only becomes a problem when he tries to pull it out.", raw);\n'''
if old_close not in text:
    raise SystemExit("drawer close anchor missing")
text = text.replace(old_close, new_close, 1)

# Version bump while preserving the save key and every previous room/audio fix.
if 'const BUILD_VERSION = "v0.3.24";' not in text:
    raise SystemExit("v0.3.24 build marker missing")
text = text.replace('const BUILD_VERSION = "v0.3.24";', 'const BUILD_VERSION = "v0.3.25";', 1)
game.write_text(text, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.24", "0.3.25").replace("sfx-v0324.js", "sfx-v0325.js")
index.write_text(i, encoding="utf-8")
old_sfx = assets / "sfx-v0324.js"
new_sfx = assets / "sfx-v0325.js"
if old_sfx.exists():
    old_sfx.rename(new_sfx)
elif not new_sfx.exists():
    raise SystemExit("Expected v0.3.24 SFX controller missing")

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 12", "versionCode 13").replace('versionName "0.3.24"', 'versionName "0.3.25"')
if 'versionCode 13' not in g or 'versionName "0.3.25"' not in g:
    raise SystemExit("Android version bump failed")
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.24.txt"
new_readme = OUT / "README-v0.3.25.txt"
if not old_readme.exists():
    raise SystemExit("v0.3.24 README missing")
r = old_readme.read_text(encoding="utf-8").replace("v0.3.24", "v0.3.25")
r += "\nv0.3.25 corrects the Master Bedroom bedside drawer parser: INSPECT DRAWER works, shaking/jiggling/wiggling can loosen the catch, careful lifting/angling/easing opens it without damage, push-in-and-try-again works, and the existing pry/coin/pen/unblock route remains valid.\n"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

required = [
    'const BUILD_VERSION = "v0.3.25";',
    'drawerWorkedLoose: false',
    '"inspect drawer"',
    '"shake drawer"',
    '"jiggle drawer"',
    '"wiggle drawer"',
    '"lift front of drawer"',
    '"pull drawer while lifting"',
    '"open drawer carefully"',
    '"pull drawer gently"',
    '"push drawer in then pull"',
    'The drawer opens cleanly',
    'ensuiteDoorFreed: false',
    'Good. Mature.',
    'Bernard is still a plunger',
    'Mira was abducted as a child and spent years being passed through a system built to train, condition, and sell people.',
    'stares at the closed door',
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.25 requirement: {needle}")

if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")
if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")

print("Exact v0.3.25 Android project generated with bedside drawer parser corrections")
