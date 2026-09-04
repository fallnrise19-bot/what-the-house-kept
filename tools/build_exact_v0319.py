from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

# Build the verified v0.3.18 base, including the reaction syntax correction.
subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0318.py")], check=True, cwd=ROOT)
subprocess.run([sys.executable, str(ROOT / "tools" / "fix_v0318_reaction_syntax.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

# Add named books as ordinary shelf texture, with a specific inspect response for each.
audit_anchor = '''  function handleBedroomAuditObjects(q, raw) {
    const f = state.flags;
    const isLook = hasAny(q, ["look", "look at", "examine", "inspect", "check", "study", "look over"]);
    const isTake = hasAny(q, ["take", "get", "pick up", "pickup", "grab"]);
'''
book_handlers = '''  function handleBedroomAuditObjects(q, raw) {
    const f = state.flags;
    const isLook = hasAny(q, ["look", "look at", "examine", "inspect", "check", "study", "look over"]);
    const isTake = hasAny(q, ["take", "get", "pick up", "pickup", "grab"]);

    if (hasAny(q, ["beneath the collar", "beneath collar", "j p lynn", "jp lynn"]) && hasAny(q, ["look", "examine", "inspect", "check", "study", "read"])) {
      say("<strong>Beneath The Collar — J.P. Lynn</strong><br>A dark psychological story about survival, control, and a bond that refuses to fit neatly into either.<br>The closer freedom gets, the harder it becomes to tell what freedom is supposed to mean.", raw);
      return true;
    }

    if (hasAny(q, ["watchers", "watchers book"]) && isLook) {
      say("A dog-eared paperback of <em>Watchers</em> by Dean Koontz. The spine has faded from being read and reshelved more than once.", raw);
      return true;
    }

    if (hasAny(q, ["intensity", "intensity book"]) && isLook) {
      say("A paperback of <em>Intensity</em> by Dean Koontz. The cover is creased at the corners and slightly bowed from use.", raw);
      return true;
    }

    if (hasAny(q, ["phantoms", "phantoms book"]) && isLook) {
      say("An older copy of <em>Phantoms</em> by Dean Koontz. The thick paperback has a cracked spine but no missing pages.", raw);
      return true;
    }

    if (hasAny(q, ["odd thomas", "odd thomas book"]) && isLook) {
      say("A paperback of <em>Odd Thomas</em> by Dean Koontz. An old receipt is still serving as a bookmark about halfway through.", raw);
      return true;
    }
'''
if audit_anchor not in text:
    raise SystemExit("Bedroom audit anchor not found")
text = text.replace(audit_anchor, book_handlers, 1)

old_books = 'say("The bookcase holds a mixture of old novels, paperbacks and books Thomas kept because throwing them away felt more difficult than reading them again. None announces itself as important.", raw);'
new_books = 'say("The bookcase holds a mixture of old novels, paperbacks and books Thomas kept because throwing them away felt more difficult than reading them again. Among the readable spines are <em>Watchers</em>, <em>Intensity</em>, <em>Phantoms</em> and <em>Odd Thomas</em> by Dean Koontz, with <em>Beneath The Collar</em> by J.P. Lynn tucked among them. None announces itself as important.", raw);'
if old_books not in text:
    raise SystemExit("Generic books response not found")
text = text.replace(old_books, new_books, 1)

old_bookcase = 'say("The narrow bookcase contains novels, magazines, an old atlas, a home-repair manual, a dictionary and a photo album. A ceramic dish on the middle shelf holds loose change, a paperclip, a button and an old key. A small wooden box with a brass lock sits on the upper shelf.", raw);'
new_bookcase = 'say("The narrow bookcase contains novels, magazines, an old atlas, a home-repair manual, a dictionary and a photo album. A few familiar spines stand out: <em>Watchers</em>, <em>Intensity</em>, <em>Phantoms</em> and <em>Odd Thomas</em> by Dean Koontz, plus <em>Beneath The Collar</em> by J.P. Lynn. A ceramic dish on the middle shelf holds loose change, a paperclip, a button and an old key. A small wooden box with a brass lock sits on the upper shelf.", raw);'
if old_bookcase not in text:
    raise SystemExit("Bookcase response not found")
text = text.replace(old_bookcase, new_bookcase, 1)

# Version bump, preserving the existing save key.
if 'const BUILD_VERSION = "v0.3.18";' not in text:
    raise SystemExit("v0.3.18 build marker not found")
text = text.replace('const BUILD_VERSION = "v0.3.18";', 'const BUILD_VERSION = "v0.3.19";', 1)
game.write_text(text, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.18", "0.3.19").replace("sfx-v0318.js", "sfx-v0319.js")
index.write_text(i, encoding="utf-8")
old_sfx = assets / "sfx-v0318.js"
old_sfx.rename(assets / "sfx-v0319.js")

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 6", "versionCode 7").replace('versionName "0.3.18"', 'versionName "0.3.19"')
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.18.txt"
r = old_readme.read_text(encoding="utf-8").replace("v0.3.18", "v0.3.19")
r += "\nBookcase detail: added Watchers, Intensity, Phantoms, Odd Thomas by Dean Koontz and Beneath The Collar by J.P. Lynn, each with inspect support.\n"
new_readme = OUT / "README-v0.3.19.txt"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

required = [
    'const BUILD_VERSION = "v0.3.19";',
    "Beneath The Collar — J.P. Lynn",
    "A dark psychological story about survival, control",
    "Watchers",
    "Intensity",
    "Phantoms",
    "Odd Thomas",
    '"go back to bedroom"',
    "stares at the closed door",
    "emptyFrameBackChecked: false",
    "hallBulbChecked: false",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.19 requirement: {needle}")

if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")
if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")

print("Exact v0.3.19 Android project generated with bookshelf titles")
