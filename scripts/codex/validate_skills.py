#!/usr/bin/env python3

from __future__ import annotations

import runpy
import sys
from pathlib import Path


def main() -> None:
    target = Path(__file__).resolve().parents[1] / "skills" / "validate_skills.py"
    sys.argv[0] = str(target)
    runpy.run_path(str(target), run_name="__main__")


if __name__ == "__main__":
    main()
