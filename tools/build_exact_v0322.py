from pathlib import Path
import base64
import gzip

payload_path = Path(__file__).with_name("build_exact_v0322.py.gz.b64")
payload = base64.b64decode(payload_path.read_text(encoding="ascii"))
source = gzip.decompress(payload).decode("utf-8")
exec(compile(source, str(Path(__file__)), "exec"), {"__name__": "__main__", "__file__": str(Path(__file__))})
