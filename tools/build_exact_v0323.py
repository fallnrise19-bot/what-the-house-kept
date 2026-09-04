from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "android-exact-v0317"

# Build the verified v0.3.22 base first, including its parser regression post-patches.
subprocess.run([sys.executable, str(ROOT / "tools" / "build_exact_v0322.py")], check=True, cwd=ROOT)

game = OUT / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

# Add absurd-but-harmless bathroom interactions at the top of the ensuite parser.
# These are deliberately opt-in: normal LOOK/TAKE/USE responses remain restrained,
# while explicitly ridiculous commands let Thomas be dry and sarcastic.
pattern = re.compile(r'(  function ensuiteCommand\(q, raw\) \{\n    const f = state\.flags;\n)')
match = pattern.search(text)
if not match:
    raise SystemExit("ensuiteCommand anchor not found")

funny = r'''

    // v0.3.23 absurd bathroom interactions. Harmless nonsense can be indulged;
    // dangerous/self-harming actions are still handled by the existing refusal rules.
    const absurdCount = (key) => {
      f[key] = (f[key] || 0) + 1;
      return f[key];
    };

    if (hasAny(q, ["interrogate toilet", "question toilet", "talk to toilet", "ask toilet what it knows", "ask toilet", "threaten toilet"])) {
      const n = absurdCount("bathroomToiletInterrogationCount");
      if (n === 1) {
        say("Thomas folds his arms and looks at the toilet. \"All right. Where were you on the night in question?\" The toilet offers the robust legal defense of being a toilet.", raw);
      } else if (n === 2) {
        say("Thomas narrows his eyes at it. \"Still not talking?\" The toilet remains professionally discreet.", raw);
      } else {
        say("Thomas decides the toilet has invoked its right to remain silent.", raw);
      }
      return true;
    }

    if (hasAny(q, ["name plunger", "name the plunger", "give plunger a name", "give the plunger a name"])) {
      const n = absurdCount("bathroomPlungerNamingCount");
      if (!f.plungerNamed && n === 1) {
        say("Thomas considers the plunger. \"No.\"", raw);
      } else {
        f.plungerNamed = true;
        say("Apparently this matters. Thomas looks at the plunger again. \"Fine. Bernard.\" Bernard remains a plunger, but now the situation is worse.", raw);
      }
      return true;
    }

    if (f.plungerNamed && hasAny(q, ["look plunger", "look at plunger", "examine plunger", "inspect plunger", "check plunger"])) {
      say("Bernard is still a plunger. The name has not improved him.", raw);
      return true;
    }

    if (hasAny(q, ["dance with plunger", "waltz with plunger", "dance with the plunger", "waltz with the plunger"])) {
      say("Thomas picks the plunger up by the handle, takes exactly two grim little steps with it, and puts it back. \"There. We have both suffered enough.\"", raw);
      return true;
    }

    if (hasAny(q, ["wear shower curtain", "wear the shower curtain", "use shower curtain as cape", "use the shower curtain as a cape", "make shower curtain cape", "make curtain cape", "wrap shower curtain around self", "wrap the shower curtain around self"])) {
      say("Thomas draws the shower curtain around his shoulders as far as the rings permit. The effect is less brooding aristocrat and more man losing an argument with vinyl. He lets it go.", raw);
      return true;
    }

    if (hasAny(q, ["wear bath mat", "wear the bath mat", "put bath mat on head", "put the bath mat on head", "bath mat hat", "wear bath mat as hat"])) {
      say("Thomas lifts the bath mat, considers the rubber backing, and lowers it again. \"I do have standards. They are low, but they exist.\"", raw);
      return true;
    }

    if (hasAny(q, ["use hair dryer as microphone", "use the hair dryer as a microphone", "hair dryer microphone", "hairdryer microphone", "sing into hair dryer", "sing into the hair dryer", "karaoke hair dryer", "karaoke with hair dryer"])) {
      say("Thomas raises the unplugged hair dryer like a microphone. \"No requests.\" He gives it one deeply uncommitted note, then sets it down.", raw);
      return true;
    }

    if (hasAny(q, ["interrogate mirror", "question mirror", "talk to mirror", "talk to the mirror", "ask mirror who is fairest", "mirror mirror", "mirror mirror on the wall"])) {
      const n = absurdCount("bathroomMirrorConversationCount");
      if (n === 1) {
        say("Thomas looks himself in the eye. \"Mirror, mirror, et cetera.\" He waits. \"Excellent. Useful as ever.\"", raw);
      } else {
        say("Thomas looks at his reflection again. \"We have already established that neither of us has anything useful to say.\"", raw);
      }
      return true;
    }

    if (hasAny(q, ["use stool as throne", "use step stool as throne", "sit on stool like king", "sit on step stool like king", "sit on throne", "king of bathroom", "declare self king"])) {
      say("Thomas sits on the little plastic stool with as much dignity as nine inches of molded plastic will permit. \"At last. My kingdom.\" He surveys the sink, toilet and tub. \"I have inherited poorly.\"", raw);
      return true;
    }

    if (hasAny(q, ["make toilet paper crown", "make a toilet paper crown", "wear toilet paper crown", "make crown from toilet paper", "toilet paper crown"])) {
      say("Thomas twists a short length of toilet paper into something that technically occupies the crown category. It lasts about four seconds. \"Strong reign.\"", raw);
      return true;
    }

    if (hasAny(q, ["wrap self in toilet paper", "wrap myself in toilet paper", "wear toilet paper", "make toilet paper mummy", "be a mummy", "mummy toilet paper"])) {
      say("Thomas winds a strip of toilet paper around his torso, looks down at himself, and stops. \"I am not using an entire roll to lose a fight with a mummy costume.\"", raw);
      return true;
    }

    if (hasAny(q, ["brush teeth with toilet brush", "brush my teeth with toilet brush", "use toilet brush as toothbrush", "use the toilet brush as a toothbrush"])) {
      say("Thomas looks at the toilet brush, then at his actual toothbrush. \"I am going to give you one chance to reconsider your priorities.\"", raw);
      return true;
    }

    if (hasAny(q, ["draw mustache with toothpaste", "draw moustache with toothpaste", "toothpaste mustache", "toothpaste moustache", "put toothpaste on nose", "paint face with toothpaste"])) {
      say("Thomas squeezes a tiny white moustache under his nose, studies it in the mirror, and wipes it off. \"Distinguished.\"", raw);
      return true;
    }

    if (hasAny(q, ["make potion", "make bathroom potion", "mix shampoo potion", "make potion with shampoo"]) && !hasAny(q, ["bleach", "cleaner", "cleaners", "cleaning chemical", "chemicals"])) {
      say("Thomas puts a drop of shampoo and conditioner in the sink, swirls it once, then stops. \"Potion complete. It cures having too much dignity.\"", raw);
      return true;
    }

    if (hasAny(q, ["nap in tub", "nap in bathtub", "sleep in tub", "sleep in bathtub", "make tub bed", "make bathtub bed"])) {
      say("Thomas climbs into the dry tub, folds his arms, and lasts about five seconds. \"Luxurious.\" He gets back out.", raw);
      return true;
    }

    if (hasAny(q, ["hide from responsibilities", "hide from life", "hide from problems", "hide in bathroom from responsibilities"])) {
      say("Thomas closes the bathroom door, stands very still for three seconds, then opens it again. \"Excellent. Everything outside has been completely solved.\"", raw);
      return true;
    }

    if (hasAny(q, ["make bathroom office", "use bathroom as office", "work from toilet", "work on toilet", "bathroom office"])) {
      say("Thomas looks at the closed toilet lid, the sink and the narrow patch of counter. \"Desk. Chair. Running water. Corporate would hate it.\"", raw);
      return true;
    }

    if (hasAny(q, ["eat toothpaste", "eat the toothpaste", "snack on toothpaste"])) {
      say("Thomas looks at the tube. \"Mint is not a food group.\" No.", raw);
      return true;
    }
'''

text = text[:match.end()] + funny + text[match.end():]

# Version bump while preserving the save key and all v0.3.22 game state.
if 'const BUILD_VERSION = "v0.3.22";' not in text:
    raise SystemExit("v0.3.22 build marker not found")
text = text.replace('const BUILD_VERSION = "v0.3.22";', 'const BUILD_VERSION = "v0.3.23";', 1)
game.write_text(text, encoding="utf-8")

assets = OUT / "app" / "src" / "main" / "assets" / "game"
index = assets / "index.html"
i = index.read_text(encoding="utf-8").replace("0.3.22", "0.3.23").replace("sfx-v0322.js", "sfx-v0323.js")
index.write_text(i, encoding="utf-8")
old_sfx = assets / "sfx-v0322.js"
new_sfx = assets / "sfx-v0323.js"
if old_sfx.exists():
    old_sfx.rename(new_sfx)
elif not new_sfx.exists():
    raise SystemExit("Expected v0.3.22 SFX controller missing")

gradle = OUT / "app" / "build.gradle"
g = gradle.read_text(encoding="utf-8").replace("versionCode 10", "versionCode 11").replace('versionName "0.3.22"', 'versionName "0.3.23"')
if 'versionCode 11' not in g or 'versionName "0.3.23"' not in g:
    raise SystemExit("Android version bump failed")
gradle.write_text(g, encoding="utf-8")

old_readme = OUT / "README-v0.3.22.txt"
new_readme = OUT / "README-v0.3.23.txt"
if not old_readme.exists():
    raise SystemExit("v0.3.22 README missing")
r = old_readme.read_text(encoding="utf-8").replace("v0.3.22", "v0.3.23")
r += "\nv0.3.23 adds opt-in absurd Ensuite interactions with Thomas's dry sarcastic voice. Normal bathroom commands remain restrained; dangerous actions still use hard refusals.\n"
new_readme.write_text(r, encoding="utf-8")
old_readme.unlink()

required = [
    'const BUILD_VERSION = "v0.3.23";',
    '"interrogate toilet"',
    '"name plunger"',
    'Bernard is still a plunger',
    '"dance with plunger"',
    '"use shower curtain as cape"',
    '"bath mat hat"',
    '"use hair dryer as microphone"',
    '"mirror mirror"',
    '"use stool as throne"',
    '"make toilet paper crown"',
    '"wrap self in toilet paper"',
    '"brush teeth with toilet brush"',
    '"draw mustache with toothpaste"',
    '"make potion"',
    '"nap in bathtub"',
    '"hide from responsibilities"',
    '"make bathroom office"',
    '"eat toothpaste"',
    "Mira was abducted as a child and spent years being passed through a system built to train, condition, and sell people.",
    "Watchers", "Intensity", "Phantoms", "Odd Thomas",
    '"go back to bedroom"',
    "stares at the closed door",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"Missing v0.3.23 requirement: {needle}")

if (assets / "audio" / "one-last-morning-loop.mp3").exists() or (assets / "music-v0313.js").exists():
    raise SystemExit("Opening music unexpectedly bundled")
if not (assets / "audio" / "bedroom-door-slam.mp3").exists():
    raise SystemExit("Door slam asset missing")

print("Exact v0.3.23 Android project generated with absurd Ensuite interactions")
