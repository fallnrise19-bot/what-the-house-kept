from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
game = ROOT / "android-exact-v0317" / "app" / "src" / "main" / "assets" / "game" / "game.js"
text = game.read_text(encoding="utf-8")
lines = text.splitlines()

matches = [i for i, line in enumerate(lines) if 'say("The open bedroom window catches the change in pressure' in line]
if len(matches) != 1:
    raise SystemExit(f"Expected one door-slam reaction line, found {len(matches)}")

i = matches[0]
indent = lines[i][: len(lines[i]) - len(lines[i].lstrip())]
lines[i] = indent + 'say(`The open bedroom window catches the change in pressure as Thomas steps into the hall. Behind him, the bedroom door slams shut hard enough to make him flinch. "Shit." He turns sharply at the sound and stares at the closed door. A second later, the cause catches up with him. "Right. Window."`, raw);'

game.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("Door-slam reaction rewritten as a valid JavaScript template string")
