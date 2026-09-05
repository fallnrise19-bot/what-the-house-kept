from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

# Build the verified v0.3.26 base first, preserving its Android reset fix.
subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0326.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")


def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f"v0.3.27 anchor missing: {label}")
    text = text.replace(old, new, 1)

# First sticky-door entry: keep the transition line, but put the actual bathroom
# description AFTER it so the player is visibly oriented in the new room.
old_door = '''      setRoom("ensuite");\n      if (kicked) {\n        say("Thomas kicks the bottom of the door. It opens immediately. He stares at it for a second. \\"Good. Mature.\\" He steps into the ensuite.", raw);\n      } else {\n        say("Thomas puts more weight into the stubborn door. The painted edge drags against the frame, then pops free hard enough to send him half a step forward into the bathroom. \\"There.\\" Apparently home maintenance has begun.", raw);\n      }\n      state.focus = null;\n      return;\n'''
new_door = '''      setRoom("ensuite");\n      if (kicked) {\n        say("Thomas kicks the bottom of the door. It opens immediately. He stares at it for a second. \\"Good. Mature.\\" He steps into the ensuite.", raw);\n      } else {\n        say("Thomas puts more weight into the stubborn door. The painted edge drags against the frame, then pops free hard enough to send him half a step forward into the bathroom. He catches himself just inside the ensuite. \\"There.\\" Apparently home maintenance has begun.", raw);\n      }\n      sceneEl.insertAdjacentHTML("beforeend", ensuiteDescriptionHtml());\n      sceneEl.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });\n      state.focus = null;\n      return;\n'''
replace_once(old_door, new_door, "sticky-door room orientation")

# New save-compatible state for Thomas's own toothbrush. Old saves merge this flag
# from initialState automatically because the save key is deliberately unchanged.
replace_once(
    '      hairbrushDiscarded: false,\n      windowExitAttemptCount: 0,',
    '      hairbrushDiscarded: false,\n      toothbrushTaken: false,\n      windowExitAttemptCount: 0,',
    "toothbrush state flag",
)

replace_once(
    '    const vanityItems = ["toothbrushes", "toothpaste"];\n',
    '    const vanityItems = [f.toothbrushTaken ? "Jennifer\\\'s toothbrush" : "toothbrushes", "toothpaste"];\n',
    "state-aware vanity toothbrush description",
)

# Broaden brush/toothbrush recognition without letting a bare BRUSH guess between
# Jennifer's hairbrush and the toothbrushes.
replace_once(
    '    const hairbrush = hasAny(q, ["hairbrush", "hair brush", "jennifer\\\'s hairbrush", "jennifer hairbrush", "jennifer\\\'s brush", "jennifer brush"]);',
    '    const hairbrush = hasAny(q, ["hairbrush", "hair brush", "jennifer\\\'s hairbrush", "jennifer hairbrush", "jennifer\\\'s brush", "jennifer brush", "brush hair", "brush my hair", "brush thomas hair", "brush thomas\\\'s hair"]);',
    "hairbrush aliases",
)
replace_once(
    '    const toothbrush = hasAny(q, ["toothbrush", "toothbrushes"]);',
    '    const toothbrush = hasAny(q, ["toothbrush", "tooth brush", "toothbrushes", "tooth brushes", "blue toothbrush", "blue tooth brush", "thomas\\\'s toothbrush", "thomas toothbrush"]);',
    "toothbrush aliases",
)
replace_once(
    '    const bandage = hasAny(q, ["cartoon bandage", "child bandage", "small bandage", "adhesive bandage", "bandage"]);',
    '    const bandage = hasAny(q, ["cartoon bandage", "child bandage", "small bandage", "adhesive bandage", "bandage"]) && !hasAny(q, ["bandage box", "box of bandages", "bandages"]);',
    "bandage-box collision",
)
replace_once(
    '    const bareBrush = q === "brush" || q === "look brush" || q === "look at brush" || q === "take brush" || q === "get brush" || q === "pick up brush" || q === "grab brush";',
    '    const bareBrush = q === "brush" || q === "look brush" || q === "look at brush" || q === "take brush" || q === "get brush" || q === "pick up brush" || q === "grab brush" || q === "clean brush" || q === "wash brush" || q === "smell brush" || q === "use brush";',
    "bare brush ambiguity",
)

# Medicine cabinet must stop respawning the cartoon bandage in prose after it was taken.
old_cabinet = '''        f.medicineCabinetOpen = true;\n        f.cartoonBandageSeen = true;\n        say("Thomas opens the mirrored medicine cabinet. Inside are toothpaste, painkillers, antacids, cotton swabs, mouthwash, Jennifer's nearly empty hand cream and a box of adhesive bandages. At the back of the lowest shelf is a single small bandage printed with cartoon animals. The wrapper has yellowed slightly with age.", raw);\n        return true;\n'''
new_cabinet = '''        f.medicineCabinetOpen = true;\n        f.cartoonBandageSeen = true;\n        say(f.cartoonBandageTaken\n          ? "Thomas opens the mirrored medicine cabinet. Inside are toothpaste, painkillers, antacids, cotton swabs, mouthwash, Jennifer's nearly empty hand cream and a box of ordinary adhesive bandages. The small cartoon bandage Thomas took is no longer tucked at the back of the lowest shelf."\n          : "Thomas opens the mirrored medicine cabinet. Inside are toothpaste, painkillers, antacids, cotton swabs, mouthwash, Jennifer's nearly empty hand cream and a box of adhesive bandages. At the back of the lowest shelf is a single small bandage printed with cartoon animals. The wrapper has yellowed slightly with age.", raw);\n        return true;\n'''
replace_once(old_cabinet, new_cabinet, "state-aware medicine cabinet")

# Hairbrush: keep all existing persistence, but make the colour explicit and broaden
# every natural wording family that manual testing exposed.
text = text.replace("Several long strands of her hair remain caught between the bristles.", "Several long brown strands of her hair remain caught between the bristles.")
text = text.replace("Several long strands of her hair are still caught between the bristles.", "Several long brown strands of her hair are still caught between the bristles.")
text = text.replace("The strands that were caught in the bristles have been removed.", "The long brown strands that were caught in the bristles have been removed.")
text = text.replace("removed the strands that had been caught in them.", "removed the long brown strands that had been caught in them.")

replace_once(
    '      if (lookIntent || q === "hairbrush" || q === "hair brush" || q === "jennifer\\\'s brush") {',
    '      if (lookIntent || q === "hairbrush" || q === "hair brush" || q === "jennifer\\\'s brush" || q === "jennifer brush" || q === "jennifer\\\'s hairbrush" || q === "jennifer hairbrush") {',
    "hairbrush bare look aliases",
)
replace_once(
    '      if (hasAny(q, ["clean hairbrush", "clean brush", "remove hair from hairbrush", "remove hair from brush", "take hair from hairbrush", "take hair from brush", "clear hairbrush", "pull hair from hairbrush", "pull hair from brush"])) {',
    '      if (hasAny(q, ["clean hairbrush", "clean hair brush", "clean jennifer\\\'s hairbrush", "clean jennifer hairbrush", "clean jennifer\\\'s brush", "clean jennifer brush", "wash hairbrush", "wash hair brush", "rinse hairbrush", "rinse hair brush", "remove hair from hairbrush", "remove hair from hair brush", "remove hair from brush", "take hair from hairbrush", "take hair from hair brush", "take hair from brush", "clear hairbrush", "clear hair brush", "pull hair from hairbrush", "pull hair from hair brush", "pull hair from brush", "pull hair out of hairbrush", "pull hair out of hair brush"])) {',
    "hairbrush clean/remove aliases",
)
replace_once(
    '          say("Thomas works the strands of Jennifer\\\'s hair free from the bristles. They cling briefly to his fingers before he gathers them together. He stands there longer than the task requires.", raw);',
    '          say("Thomas works the strands of Jennifer\\\'s brown hair free from the bristles, then rinses the brush under warm water. The hairs cling briefly to his fingers before he gathers them together. He stands there longer than the task requires.", raw);',
    "hairbrush clean response",
)
replace_once(
    '      if (hasAny(q, ["smell hairbrush", "smell hair brush", "smell jennifer\\\'s brush"])) {',
    '      if (hasAny(q, ["smell hairbrush", "smell hair brush", "smell jennifer\\\'s brush", "smell jennifer brush", "smell jennifer\\\'s hairbrush", "sniff hairbrush", "sniff hair brush"])) {',
    "hairbrush smell aliases",
)

put_back_anchor = '''      if (hasAny(q, ["put hairbrush back", "put brush back", "return hairbrush", "set hairbrush down", "leave hairbrush"])) {\n'''
use_handler = '''      if (hasAny(q, ["brush hair", "brush my hair", "brush thomas hair", "brush thomas's hair", "use hairbrush", "use hair brush", "use jennifer's hairbrush", "use jennifer's brush"])) {\n        if (f.hairbrushDiscarded) say("The hairbrush is no longer here.", raw);\n        else say("Thomas runs the brush once through his hair, catches a snag, and stops. \\"Useful.\\" He puts it back where it was.", raw);\n        return true;\n      }\n\n      if (hasAny(q, ["put hairbrush back", "put hair brush back", "put jennifer's brush back", "put jennifer brush back", "put jennifer's hairbrush back", "return hairbrush", "return hair brush", "set hairbrush down", "set hair brush down", "leave hairbrush", "leave hair brush"])) {\n'''
replace_once(put_back_anchor, use_handler, "hairbrush use/put-back aliases")
replace_once(
    '      if (hasAny(q, ["throw away hairbrush", "throw hairbrush away", "discard hairbrush", "bin hairbrush", "put hairbrush in bin", "put brush in bin"])) {',
    '      if (hasAny(q, ["throw away hairbrush", "throw away hair brush", "throw hairbrush away", "throw hair brush away", "discard hairbrush", "discard hair brush", "bin hairbrush", "bin hair brush", "put hairbrush in bin", "put hair brush in bin", "put brush in bin"])) {',
    "hairbrush discard aliases",
)

# Toothbrush family: explicit noun variants can be inspected, carried and put back.
# BRUSH TEETH is understood even without naming the toothbrush; Thomas refuses only
# because his own brush has been sitting untouched for more than a year.
old_toothbrush = '''    if (toothbrush && (lookIntent || q === "toothbrush" || q === "toothbrushes")) {\n      say("Two old toothbrushes sit in the chipped ceramic mug: Thomas's blue one and Jennifer's white one with a faded green stripe.", raw);\n      return true;\n    }\n\n'''
new_toothbrush = '''    if (hasAny(q, ["brush teeth", "brush my teeth", "brush thomas teeth", "brush thomas's teeth", "use toothbrush to brush teeth", "use tooth brush to brush teeth", "brush teeth with toothbrush", "brush teeth with tooth brush"]) && !hasAny(q, ["toilet brush"])) {\n      say("Thomas picks up his old blue toothbrush, looks at the flattened bristles, and puts it back. \\"No. That has been sitting here for over a year. I can buy another toothbrush.\\"", raw);\n      return true;\n    }\n\n    if (toothbrush) {\n      if (lookIntent || q === "toothbrush" || q === "tooth brush" || q === "toothbrushes" || q === "tooth brushes" || q === "blue toothbrush" || q === "blue tooth brush" || q === "thomas's toothbrush" || q === "thomas toothbrush") {\n        say(f.toothbrushTaken\n          ? "Thomas has his old blue toothbrush. Jennifer's white toothbrush with the faded green stripe remains in the chipped ceramic mug."\n          : "Two old toothbrushes sit in the chipped ceramic mug: Thomas's blue one and Jennifer's white one with a faded green stripe.", raw);\n        return true;\n      }\n      if (takeIntent) {\n        if (f.toothbrushTaken || hasItem("Thomas's blue toothbrush")) say("Thomas already has his old blue toothbrush.", raw);\n        else {\n          f.toothbrushTaken = true;\n          addInventory("Thomas's blue toothbrush");\n          say("Thomas takes his old blue toothbrush from the mug. Jennifer's stays where it is.", raw);\n        }\n        return true;\n      }\n      if (hasAny(q, ["put toothbrush back", "put tooth brush back", "return toothbrush", "return tooth brush", "set toothbrush down", "set tooth brush down"])) {\n        if (!f.toothbrushTaken && !hasItem("Thomas's blue toothbrush")) say("Thomas's toothbrush is already in the mug.", raw);\n        else {\n          f.toothbrushTaken = false;\n          removeInventory("Thomas's blue toothbrush");\n          say("Thomas puts his blue toothbrush back in the chipped ceramic mug.", raw);\n        }\n        return true;\n      }\n    }\n\n'''
replace_once(old_toothbrush, new_toothbrush, "toothbrush command family")

# Mouthwash should have object-specific voice rather than a generic refusal.
mouthwash_anchor = '    if (lookIntent && hasAny(q, ["painkillers", "painkiller"])) { say("An old bottle of over-the-counter painkillers. Nothing unusual about it.", raw); return true; }\n'
mouthwash_block = '''    if (hasAny(q, ["mouthwash"])) {\n      if (hasAny(q, ["drink", "swallow"])) {\n        say("Thomas tips the bottle enough to read the label. \\"Rinse and spit.\\" He taps the words with one finger. \\"I think I can manage the two-step program.\\" He puts it back.", raw);\n        return true;\n      }\n      if (hasAny(q, ["use", "rinse", "gargle", "wash mouth", "rinse mouth"])) {\n        say("Thomas considers the bottle, then the fact it has been sitting here untouched for over a year. \\"I'll buy new mouthwash.\\"", raw);\n        return true;\n      }\n    }\n\n''' + mouthwash_anchor
replace_once(mouthwash_anchor, mouthwash_block, "mouthwash reactions")

# The ordinary bandage box also respects the taken state.
replace_once(
    '    if (lookIntent && hasAny(q, ["bandage box", "box of bandages", "bandages"]) && !hasAny(q, ["cartoon", "child", "small"])) { say("A mixed box of ordinary adhesive bandages. One small cartoon-printed bandage was tucked behind it.", raw); return true; }',
    '    if (lookIntent && hasAny(q, ["bandage box", "box of bandages", "bandages"]) && !hasAny(q, ["cartoon", "child", "small"])) { say(f.cartoonBandageTaken ? "A mixed box of ordinary adhesive bandages. The small cartoon-printed bandage Thomas found behind it is gone now." : "A mixed box of ordinary adhesive bandages. One small cartoon-printed bandage is tucked behind it.", raw); return true; }',
    "bandage-box taken state",
)

# Split chemical safety responses so drinking and mixing do not share one silent,
# generic line. Both remain hard refusals and neither gives procedural detail.
old_chem = '''    if (hasAny(q, ["bleach", "cleaner", "cleaners", "cleaning chemical", "cleaning chemicals"]) && hasAny(q, ["drink", "swallow", "mix", "combine", "pour together", "mix together"])) {\n      say("Thomas refuses immediately. He is not drinking or combining household chemicals.", raw);\n      return true;\n    }\n'''
new_chem = '''    if (hasAny(q, ["bleach", "cleaner", "cleaners", "cleaning chemical", "cleaning chemicals"]) && hasAny(q, ["drink", "swallow"])) {\n      say("Thomas picks up the bottle, reads the warning label, and sets it straight back down. \\"No. I am not getting defeated by bathroom cleaner.\\"", raw);\n      return true;\n    }\n    if (hasAny(q, ["bleach", "cleaner", "cleaners", "cleaning chemical", "cleaning chemicals"]) && hasAny(q, ["mix", "combine", "pour together", "mix together"])) {\n      say("Thomas refuses immediately. He looks from the bleach to the other bottles. \\"Absolutely not.\\" He puts them back. \\"One disaster at a time.\\"", raw);\n      return true;\n    }\n'''
replace_once(old_chem, new_chem, "separate cleaner safety voice")

# Version/package bump. Save key deliberately remains unchanged.
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
r += "\nv0.3.27 is a manual Ensuite correction pass: the first sticky-door entry now shows the room description after the transition, toothbrush/tooth-brush commands are recognized, BRUSH TEETH gets an object-specific response, mouthwash and cleaner refusals have Thomas's voice, the medicine cabinet no longer respawns the taken cartoon bandage in prose, and Jennifer's hairbrush command family is broadened with brown hair stated explicitly.\n"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

required = [
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
    'webView.setWebChromeClient(new WebChromeClient());' if False else 'wthk-starter-v0.3.3',
    'drawerWorkedLoose: false',
    'ensuiteDoorFreed: false',
    'Bernard is still a plunger',
    'stares at the closed door',
]
for needle in required:
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
