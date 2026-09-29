"""Filesystem locations for bundled reference datasets.

``DATA_DIR`` points at the repo-level ``data/`` directory in a checkout, and can be
overridden with ``AGRIMITRA_DATA_DIR`` for container images that copy the datasets
next to the service.
"""

from __future__ import annotations

import os
from pathlib import Path

_SERVICE_ROOT = Path(__file__).resolve().parents[2]  # services/api


def _resolve_data_dir() -> Path:
    override = os.getenv("AGRIMITRA_DATA_DIR")
    if override:
        return Path(override)
    for candidate in (_SERVICE_ROOT / "data", *(p / "data" for p in _SERVICE_ROOT.parents)):
        if (candidate / "crops.json").is_file():
            return candidate
    raise FileNotFoundError(
        "Could not locate the reference data directory. Set AGRIMITRA_DATA_DIR."
    )


DATA_DIR = _resolve_data_dir()
