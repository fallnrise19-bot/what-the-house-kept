from pathlib import Path
import runpy

# Canonical v0.3.27 entry point. The verified implementation lives beside this
# file so future version builders can continue calling build_exact_v0327.py.
runpy.run_path(str(Path(__file__).with_name("build_exact_v0327_fixed.py")), run_name="__main__")
