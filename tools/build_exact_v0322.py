from pathlib import Path
import base64
import gzip

payload_path = Path(__file__).with_name("build_exact_v0322.py.gz.b64")
payload = base64.b64decode(payload_path.read_text(encoding="ascii"))
source = gzip.decompress(payload).decode("utf-8")
exec(compile(source, str(Path(__file__)), "exec"), {"__name__": "__main__", "__file__": str(Path(__file__))})

# Small post-patch fixes found by running the generated parser through a real command harness.
# Keeping them here makes the CI artifact match the locally regression-tested v0.3.22 source.
root = Path(__file__).resolve().parents[1]
game = root / "android-exact-v0317" / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")

text = text.replace(
    'const hairbrush = hasAny(q, ["hairbrush", "hair brush", "jennifer\'s hairbrush", "jennifer hairbrush", "jennifer\'s brush"]);',
    'const hairbrush = hasAny(q, ["hairbrush", "hair brush", "jennifer\'s hairbrush", "jennifer hairbrush", "jennifer\'s brush", "jennifer brush"]);',
    1,
)

text = text.replace(
    'if (lookIntent || q === "stool" || q === "step stool") {',
    'if ((lookIntent || q === "stool" || q === "step stool") && !hasAny(q, ["behind stool", "under stool", "beneath stool", "where stool was", "floor behind stool", "floor under stool", "floor beneath stool", "wall behind stool", "skirting", "baseboard"])) {',
    1,
)

curtain_anchor = '''    // Shower curtain is resolved before SHOWER so curtain commands cannot start the water.\n    if (showerCurtain) {\n'''
curtain_extra = '''    // LOOK/CHECK/INSPECT BEHIND CURTAIN is an opening/inspection action, not a generic LOOK at fabric.\n    if (showerCurtain && hasAny(q, ["look behind", "check behind", "inspect behind"])) {\n      f.showerCurtainOpen = true;\n      say("Thomas pulls the curtain aside. The tub is empty. Several old bottles of shampoo and body wash remain on a narrow shelf. One has fallen onto its side.", raw);\n      return true;\n    }\n\n    // Shower curtain is resolved before SHOWER so curtain commands cannot start the water.\n    if (showerCurtain) {\n'''
if curtain_anchor not in text:
    raise SystemExit("v0.3.22 curtain anchor missing")
text = text.replace(curtain_anchor, curtain_extra, 1)

text = text.replace(
    'if (hasAny(q, ["remove", "unscrew", "take off", "open"])) {',
    'if (hasAny(q, ["remove", "unscrew", "take off", "open", "use screwdriver", "use small screwdriver"])) {',
    1,
)

hairdryer_anchor = '''    if (hairDryerMentioned && hasAny(q, ["plug in", "plug", "turn on", "switch on", "test", "use"]) && !waterTarget) {\n'''
hairdryer_extra = '''    // Drying the wet floor must win before the generic USE HAIR DRYER action.\n    if (hairDryerMentioned && hasAny(q, ["floor", "wet floor"]) && hasAny(q, ["dry", "use"])) {\n      if (!f.bathroomFloorWet) say("The floor is already dry enough that this would mostly be an exercise in noise.", raw);\n      else {\n        f.bathroomFloorWet = false;\n        say("Thomas points warm air across the wet tile until the worst of the water is gone. This is slower than using a towel and therefore exactly the sort of solution the morning has encouraged.", raw);\n      }\n      return true;\n    }\n\n    if (hairDryerMentioned && hasAny(q, ["plug in", "plug", "turn on", "switch on", "test", "use"]) && !waterTarget) {\n'''
if hairdryer_anchor not in text:
    raise SystemExit("v0.3.22 hair-dryer anchor missing")
text = text.replace(hairdryer_anchor, hairdryer_extra, 1)

game.write_text(text, encoding="utf-8")
print("Applied v0.3.22 parser regression post-patches")
