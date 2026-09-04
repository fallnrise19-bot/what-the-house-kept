from pathlib import Path
import base64
import gzip

PARTS = [
    "runtime/v0.3.10/game.part1.b64",
    "runtime/v0.3.10/game.part2.b64",
    "runtime/v0.3.10/game.part3.b64",
    "runtime/v0.3.10/game.part4.b64",
    "runtime/v0.3.10/game.part5a.b64",
    "runtime/v0.3.10/game.part5b.b64",
    "runtime/v0.3.10/game.part6a.b64",
    "runtime/v0.3.10/game.part6b.b64",
    "runtime/v0.3.10/game.part7.b64",
]

packed = base64.b64decode("".join(Path(p).read_text(encoding="utf-8").strip() for p in PARTS))
source = gzip.decompress(packed).decode("utf-8")

old_version = 'const BUILD_VERSION = "v0.3.10";'
if old_version not in source:
    raise SystemExit("Version patch target not found")
source = source.replace(old_version, 'const BUILD_VERSION = "v0.3.13";', 1)

old_tail = '''        </section>
      </div>
      <p class="floorplan-caption">The far room is marked <strong>Storage</strong>. Nothing on the plan identifies it as anyone's bedroom.</p>'''
new_tail = '''        </section>
        <section class="floorplan-floor">
          <h3>Basement</h3>
          <div class="floorplan-room"><b>Utility / Laundry</b><span>12 × 14</span></div>
          <div class="floorplan-room"><b>Workshop</b><span>14 × 14</span></div>
          <div class="floorplan-room"><b>Storage</b><span>26 × 18</span></div>
        </section>
        <section class="floorplan-floor">
          <h3>Attic</h3>
          <div class="floorplan-room"><b>Office</b><span>14 × 17</span></div>
          <div class="floorplan-room"><b>Attic Storage</b><span>14 × 16</span></div>
          <div class="floorplan-room"><b>Box / Half Bath</b><span>8 × 10</span></div>
          <div class="floorplan-room"><b>Eaves</b><span>unmeasured</span></div>
        </section>
      </div>'''
if old_tail not in source:
    raise SystemExit("Floor-plan patch target not found")
source = source.replace(old_tail, new_tail, 1)

out = Path("recovered")
out.mkdir(parents=True, exist_ok=True)
(out / "game-v0313.js").write_text(source, encoding="utf-8")

needles = [
    "function initialState",
    "windowOpen",
    "bedroomDoor",
    "upstairs hall",
    "hallway",
    "currentRoom",
    "renderHall",
    "leave bedroom",
    "enter hall",
    "go hall",
]
lines = source.splitlines()
selected = set()
for i, line in enumerate(lines):
    if any(needle.lower() in line.lower() for needle in needles):
        for j in range(max(0, i - 8), min(len(lines), i + 14)):
            selected.add(j)

blocks = []
block = []
previous = None
for i in sorted(selected):
    if previous is None or i == previous + 1:
        block.append(i)
    else:
        blocks.append(block)
        block = [i]
    previous = i
if block:
    blocks.append(block)

snippets = []
for block in blocks:
    snippets.append(
        f"--- lines {block[0] + 1}-{block[-1] + 1} ---\n"
        + "\n".join(f"{i + 1}: {lines[i]}" for i in block)
    )
(out / "transition-snippets.txt").write_text("\n\n".join(snippets), encoding="utf-8")
print(f"Recovered exact v0.3.13 source: {len(source):,} bytes, {len(lines):,} lines")
