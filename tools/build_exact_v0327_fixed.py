from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0326.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")


def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f"v0.3.27 anchor missing: {label}")
    text = text.replace(old, new, 1)


def replace_line_containing(marker, new_line, label):
    global text
    lines = text.splitlines(keepends=True)
    matches = [i for i, line in enumerate(lines) if marker in line]
    if len(matches) != 1:
        raise SystemExit(f"v0.3.27 line anchor problem ({len(matches)} matches): {label}")
    ending = "\n" if lines[matches[0]].endswith("\n") else ""
    lines[matches[0]] = new_line + ending
    text = "".join(lines)


# First sticky-door entry: transition first, then the full current bathroom description.
old_door = '''      setRoom("ensuite");
      if (kicked) {
        say("Thomas kicks the bottom of the door. It opens immediately. He stares at it for a second. \\"Good. Mature.\\" He steps into the ensuite.", raw);
      } else {
        say("Thomas puts more weight into the stubborn door. The painted edge drags against the frame, then pops free hard enough to send him half a step forward into the bathroom. \\"There.\\" Apparently home maintenance has begun.", raw);
      }
      state.focus = null;
      return;
'''
new_door = '''      setRoom("ensuite");
      sceneEl.innerHTML = "";
      if (kicked) {
        say("Thomas kicks the bottom of the door. It opens immediately. He stares at it for a second. \\"Good. Mature.\\" He steps into the ensuite.", raw);
      } else {
        say("Thomas puts more weight into the stubborn door. The painted edge drags against the frame, then pops free hard enough to send him half a step forward into the bathroom. He catches himself just inside the ensuite. \\"There.\\" Apparently home maintenance has begun.", raw);
      }
      sceneEl.insertAdjacentHTML("beforeend", ensuiteDescriptionHtml());
      sceneEl.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      state.focus = null;
      return;
'''
replace_once(old_door, new_door, "sticky-door room orientation")

replace_once(
    "      hairbrushDiscarded: false,\n      windowExitAttemptCount: 0,",
    "      hairbrushDiscarded: false,\n      toothbrushTaken: false,\n      windowExitAttemptCount: 0,",
    "toothbrush state flag",
)
replace_once(
    '    const vanityItems = ["toothbrushes", "toothpaste"];',
    '    const vanityItems = [f.toothbrushTaken ? "Jennifer\'s toothbrush" : "toothbrushes", "toothpaste"];',
    "state-aware vanity toothbrush description",
)

replace_line_containing(
    "const hairbrush = hasAny(q,",
    '''    const hairbrush = hasAny(q, ["hairbrush", "hair brush", "jennifer's hairbrush", "jennifer hairbrush", "jennifer's brush", "jennifer brush", "brush hair", "brush my hair", "brush thomas hair", "brush thomas's hair"]);''',
    "hairbrush aliases",
)
replace_line_containing(
    "const toothbrush = hasAny(q,",
    '''    const toothbrush = hasAny(q, ["toothbrush", "tooth brush", "toothbrushes", "tooth brushes", "blue toothbrush", "blue tooth brush", "thomas's toothbrush", "thomas toothbrush"]);''',
    "toothbrush aliases",
)
replace_line_containing(
    "const bandage = hasAny(q,",
    '''    const bandage = hasAny(q, ["cartoon bandage", "child bandage", "small bandage", "adhesive bandage", "bandage"]) && !hasAny(q, ["bandage box", "box of bandages", "bandages"]);''',
    "bandage-box collision",
)
replace_line_containing(
    "const bareBrush =",
    '''    const bareBrush = q === "brush" || q === "look brush" || q === "look at brush" || q === "take brush" || q === "get brush" || q === "pick up brush" || q === "grab brush" || q === "clean brush" || q === "wash brush" || q === "smell brush" || q === "use brush";''',
    "bare brush ambiguity",
)

old_cabinet = '''        f.medicineCabinetOpen = true;
        f.cartoonBandageSeen = true;
        say("Thomas opens the mirrored medicine cabinet. Inside are toothpaste, painkillers, antacids, cotton swabs, mouthwash, Jennifer's nearly empty hand cream and a box of adhesive bandages. At the back of the lowest shelf is a single small bandage printed with cartoon animals. The wrapper has yellowed slightly with age.", raw);
        return true;
'''
new_cabinet = '''        f.medicineCabinetOpen = true;
        f.cartoonBandageSeen = true;
        say(f.cartoonBandageTaken
          ? "Thomas opens the mirrored medicine cabinet. Inside are toothpaste, painkillers, antacids, cotton swabs, mouthwash, Jennifer's nearly empty hand cream and a box of ordinary adhesive bandages. The small cartoon bandage Thomas took is no longer tucked at the back of the lowest shelf."
          : "Thomas opens the mirrored medicine cabinet. Inside are toothpaste, painkillers, antacids, cotton swabs, mouthwash, Jennifer's nearly empty hand cream and a box of adhesive bandages. At the back of the lowest shelf is a single small bandage printed with cartoon animals. The wrapper has yellowed slightly with age.", raw);
        return true;
'''
replace_once(old_cabinet, new_cabinet, "state-aware medicine cabinet")

# Hairbrush content and command-family audit.
text = text.replace("Several long strands of her hair remain caught between the bristles.", "Several long brown strands of her hair remain caught between the bristles.")
text = text.replace("Several long strands of her hair are still caught between the bristles.", "Several long brown strands of her hair are still caught between the bristles.")
text = text.replace("The strands that were caught in the bristles have been removed.", "The long brown strands that were caught in the bristles have been removed.")
text = text.replace("removed the strands that had been caught in them.", "removed the long brown strands that had been caught in them.")

replace_once(
    '''      if (lookIntent || q === "hairbrush" || q === "hair brush" || q === "jennifer's brush") {''',
    '''      if (lookIntent || q === "hairbrush" || q === "hair brush" || q === "jennifer's brush" || q === "jennifer brush" || q === "jennifer's hairbrush" || q === "jennifer hairbrush") {''',
    "hairbrush bare look aliases",
)
replace_once(
    '''      if (hasAny(q, ["clean hairbrush", "clean brush", "remove hair from hairbrush", "remove hair from brush", "take hair from hairbrush", "take hair from brush", "clear hairbrush", "pull hair from hairbrush", "pull hair from brush"])) {''',
    '''      if (hasAny(q, ["clean hairbrush", "clean hair brush", "clean jennifer's hairbrush", "clean jennifer hairbrush", "clean jennifer's brush", "clean jennifer brush", "wash hairbrush", "wash hair brush", "rinse hairbrush", "rinse hair brush", "remove hair from hairbrush", "remove hair from hair brush", "remove hair from brush", "take hair from hairbrush", "take hair from hair brush", "take hair from brush", "clear hairbrush", "clear hair brush", "pull hair from hairbrush", "pull hair from hair brush", "pull hair from brush", "pull hair out of hairbrush", "pull hair out of hair brush"])) {''',
    "hairbrush clean/remove aliases",
)
replace_once(
    '''          say("Thomas works the strands of Jennifer's hair free from the bristles. They cling briefly to his fingers before he gathers them together. He stands there longer than the task requires.", raw);''',
    '''          say("Thomas works the strands of Jennifer's brown hair free from the bristles, then rinses the brush under warm water. The hairs cling briefly to his fingers before he gathers them together. He stands there longer than the task requires.", raw);''',
    "hairbrush clean response",
)
replace_once(
    '''      if (hasAny(q, ["smell hairbrush", "smell hair brush", "smell jennifer's brush"])) {''',
    '''      if (hasAny(q, ["smell hairbrush", "smell hair brush", "smell jennifer's brush", "smell jennifer brush", "smell jennifer's hairbrush", "sniff hairbrush", "sniff hair brush"])) {''',
    "hairbrush smell aliases",
)
replace_once(
    '''      if (hasAny(q, ["put hairbrush back", "put brush back", "return hairbrush", "set hairbrush down", "leave hairbrush"])) {''',
    '''      if (hasAny(q, ["brush hair", "brush my hair", "brush thomas hair", "brush thomas's hair", "use hairbrush", "use hair brush", "use jennifer's hairbrush", "use jennifer's brush"])) {
        if (f.hairbrushDiscarded) say("The hairbrush is no longer here.", raw);
        else say("Thomas runs the brush once through his hair, catches a snag, and stops. \\"Useful.\\" He puts it back where it was.", raw);
        return true;
      }
      if (hasAny(q, ["put hairbrush back", "put hair brush back", "put jennifer's brush back", "put jennifer brush back", "put jennifer's hairbrush back", "return hairbrush", "return hair brush", "set hairbrush down", "set hair brush down", "leave hairbrush", "leave hair brush"])) {''',
    "hairbrush use/put-back aliases",
)
replace_once(
    '''      if (hasAny(q, ["throw away hairbrush", "throw hairbrush away", "discard hairbrush", "bin hairbrush", "put hairbrush in bin", "put brush in bin"])) {''',
    '''      if (hasAny(q, ["throw away hairbrush", "throw away hair brush", "throw hairbrush away", "throw hair brush away", "discard hairbrush", "discard hair brush", "bin hairbrush", "bin hair brush", "put hairbrush in bin", "put hair brush in bin", "put brush in bin"])) {''',
    "hairbrush discard aliases",
)

old_toothbrush = '''    if (toothbrush && (lookIntent || q === "toothbrush" || q === "toothbrushes")) {
      say("Two old toothbrushes sit in the chipped ceramic mug: Thomas's blue one and Jennifer's white one with a faded green stripe.", raw);
      return true;
    }
'''
new_toothbrush = '''    if (hasAny(q, ["brush teeth", "brush my teeth", "brush thomas teeth", "brush thomas's teeth", "use toothbrush to brush teeth", "use tooth brush to brush teeth", "brush teeth with toothbrush", "brush teeth with tooth brush"]) && !hasAny(q, ["toilet brush"])) {
      say("Thomas picks up his old blue toothbrush, looks at the flattened bristles, and puts it back. \\"No. That has been sitting here for over a year. I can buy another toothbrush.\\"", raw);
      return true;
    }

    if (toothbrush) {
      if (lookIntent || q === "toothbrush" || q === "tooth brush" || q === "toothbrushes" || q === "tooth brushes" || q === "blue toothbrush" || q === "blue tooth brush" || q === "thomas's toothbrush" || q === "thomas toothbrush") {
        say(f.toothbrushTaken
          ? "Thomas has his old blue toothbrush. Jennifer's white toothbrush with the faded green stripe remains in the chipped ceramic mug."
          : "Two old toothbrushes sit in the chipped ceramic mug: Thomas's blue one and Jennifer's white one with a faded green stripe.", raw);
        return true;
      }
      if (takeIntent) {
        if (f.toothbrushTaken || hasItem("Thomas's blue toothbrush")) say("Thomas already has his old blue toothbrush.", raw);
        else {
          f.toothbrushTaken = true;
          addInventory("Thomas's blue toothbrush");
          say("Thomas takes his old blue toothbrush from the mug. Jennifer's stays where it is.", raw);
        }
        return true;
      }
      if (hasAny(q, ["put toothbrush back", "put tooth brush back", "return toothbrush", "return tooth brush", "set toothbrush down", "set tooth brush down"])) {
        if (!f.toothbrushTaken && !hasItem("Thomas's blue toothbrush")) say("Thomas's toothbrush is already in the mug.", raw);
        else {
          f.toothbrushTaken = false;
          removeInventory("Thomas's blue toothbrush");
          say("Thomas puts his blue toothbrush back in the chipped ceramic mug.", raw);
        }
        return true;
      }
    }
'''
replace_once(old_toothbrush, new_toothbrush, "toothbrush command family")

painkiller_line = '''    if (lookIntent && hasAny(q, ["painkillers", "painkiller"])) { say("An old bottle of over-the-counter painkillers. Nothing unusual about it.", raw); return true; }'''
mouthwash_block = '''    if (hasAny(q, ["mouthwash"])) {
      if (hasAny(q, ["drink", "swallow"])) {
        say("Thomas tips the bottle enough to read the label. \\"Rinse and spit.\\" He taps the words with one finger. \\"I think I can manage the two-step program.\\" He puts it back.", raw);
        return true;
      }
      if (hasAny(q, ["use", "rinse", "gargle", "wash mouth", "rinse mouth"])) {
        say("Thomas considers the bottle, then the fact it has been sitting here untouched for over a year. \\"I'll buy new mouthwash.\\"", raw);
        return true;
      }
    }

''' + painkiller_line
replace_once(painkiller_line, mouthwash_block, "mouthwash reactions")

old_bandage_box = '''    if (lookIntent && hasAny(q, ["bandage box", "box of bandages", "bandages"]) && !hasAny(q, ["cartoon", "child", "small"])) { say("A mixed box of ordinary adhesive bandages. One small cartoon-printed bandage was tucked behind it.", raw); return true; }'''
new_bandage_box = '''    if (lookIntent && hasAny(q, ["bandage box", "box of bandages", "bandages"]) && !hasAny(q, ["cartoon", "child", "small"])) { say(f.cartoonBandageTaken ? "A mixed box of ordinary adhesive bandages. The small cartoon-printed bandage Thomas found behind it is gone now." : "A mixed box of ordinary adhesive bandages. One small cartoon-printed bandage is tucked behind it.", raw); return true; }'''
replace_once(old_bandage_box, new_bandage_box, "bandage-box taken state")

old_chem = '''    if (hasAny(q, ["bleach", "cleaner", "cleaners", "cleaning chemical", "cleaning chemicals"]) && hasAny(q, ["drink", "swallow", "mix", "combine", "pour together", "mix together"])) {
      say("Thomas refuses immediately. He is not drinking or combining household chemicals.", raw);
      return true;
    }
'''
new_chem = '''    if (hasAny(q, ["bleach", "cleaner", "cleaners", "cleaning chemical", "cleaning chemicals"]) && hasAny(q, ["drink", "swallow"])) {
      say("Thomas picks up the bottle, reads the warning label, and sets it straight back down. \\"No. I am not getting defeated by bathroom cleaner.\\"", raw);
      return true;
    }
    if (hasAny(q, ["bleach", "cleaner", "cleaners", "cleaning chemical", "cleaning chemicals"]) && hasAny(q, ["mix", "combine", "pour together", "mix together"])) {
      say("Thomas refuses immediately. He looks from the bleach to the other bottles. \\"Absolutely not.\\" He puts them back. \\"One disaster at a time.\\"", raw);
      return true;
    }
'''
replace_once(old_chem, new_chem, "separate cleaner safety voice")

replace_once('const BUILD_VERSION = "v0.3.26";', 'const BUILD_VERSION = "v0.3.27";', "build marker")
game.write_text(text, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.26", "0.3.27").replace("sfx-v0326.js", "sfx-v0327.js")
index.write_text(i, encoding="utf-8")
old_sfx = assets / "sfx-v0326.js"
new_sfx = assets / "sfx-v0327.js"
if old_sfx.exists():
    old_sfx.rename(new_sfx)
elif not new_sfx.exists():
    raise SystemExit("Expected v0.3.26 SFX controller missing")

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 14", "versionCode 15").replace('versionName "0.3.26"', 'versionName "0.3.27"')
if 'versionCode 15' not in g or 'versionName "0.3.27"' not in g:
    raise SystemExit("Android version bump failed")
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.26.txt"
new_readme = OUT / "README-v0.3.27.txt"
if not old_readme.exists():
    raise SystemExit("v0.3.26 README missing")
r = old_readme.read_text(encoding="utf-8").replace("v0.3.26", "v0.3.27")
r += "\nv0.3.27 is a manual Ensuite correction pass: first sticky-door entry now presents the bathroom description after the transition; toothbrush/tooth-brush commands and BRUSH TEETH are recognized; mouthwash and cleaner refusals have Thomas's voice; the medicine cabinet no longer respawns a taken cartoon bandage in prose; and Jennifer's hairbrush command family is broadened with her brown hair stated explicitly.\n"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

for needle in [
    'const BUILD_VERSION = "v0.3.27";',
    'toothbrushTaken: false',
    '"brush teeth"',
    '"tooth brush"',
    'Rinse and spit.',
    'no longer tucked at the back of the lowest shelf',
    'Several long brown strands',
    '"clean hair brush"',
    '"use hair brush"',
    'not getting defeated by bathroom cleaner',
    'One disaster at a time.',
    'sceneEl.insertAdjacentHTML("beforeend", ensuiteDescriptionHtml());',
    'history = [];',
    'wthk-starter-v0.3.3',
    'drawerWorkedLoose: false',
    'ensuiteDoorFreed: false',
    'Bernard is still a plunger',
    'stares at the closed door',
]:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.27 requirement: {needle}")

main = OUT / "app" / "src" / "main" / "java" / "com" / "creativepixels" / "whatthehousekept" / "MainActivity.java"
j = main.read_text(encoding="utf-8")
for needle in ['import android.webkit.WebChromeClient;', 'webView.setWebChromeClient(new WebChromeClient());']:
    if needle not in j:
        raise SystemExit(f"Reset support regressed: {needle}")

if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")
if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")

print("Exact v0.3.27 Android project generated with manual Ensuite corrections")
