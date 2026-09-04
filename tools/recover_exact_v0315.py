from pathlib import Path
import base64, gzip

ROOT = Path(__file__).resolve().parents[1]
parts = [ROOT / 'runtime' / 'v0.3.15' / f'game.part{i}.b64' for i in range(1, 6)]
packed = base64.b64decode(''.join(p.read_text(encoding='utf-8').strip() for p in parts))
source = gzip.decompress(packed).decode('utf-8')
out = ROOT / 'recovered-v0315'
out.mkdir(exist_ok=True)
(out / 'game-v0315.js').write_text(source, encoding='utf-8')

needles = [
    'function initialState', 'windowOpen', 'bedroomDoorOpen', 'hallCommand',
    'Upstairs Hall', 'leave bedroom', 'go hallway', 'enter hallway',
    'floorPlan', 'mattress', 'photo', 'outlet', 'charger'
]
lines = source.splitlines()
selected = set()
for i, line in enumerate(lines):
    if any(n.lower() in line.lower() for n in needles):
        for j in range(max(0, i-7), min(len(lines), i+12)):
            selected.add(j)
blocks=[]; cur=[]; prev=None
for i in sorted(selected):
    if prev is None or i == prev + 1:
        cur.append(i)
    else:
        blocks.append(cur); cur=[i]
    prev=i
if cur: blocks.append(cur)
text=[]
for b in blocks:
    text.append(f'--- lines {b[0]+1}-{b[-1]+1} ---\n' + '\n'.join(f'{i+1}: {lines[i]}' for i in b))
(out / 'snippets.txt').write_text('\n\n'.join(text), encoding='utf-8')
print(f'Recovered exact v0.3.15 source: {len(source):,} bytes, {len(lines):,} lines')
