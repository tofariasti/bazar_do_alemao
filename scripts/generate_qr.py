#!/usr/bin/env python3
"""Gera QR Code do site para vitrine (assets/images/qr-site.png)."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "assets" / "site-config.json"
OUT = ROOT / "assets" / "images" / "qr-site.png"


def main() -> None:
    url = sys.argv[1] if len(sys.argv) > 1 else None
    if not url and CONFIG.exists():
        cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
        url = cfg.get("canonicalUrl") or cfg.get("siteUrl")
    if not url:
        print("Informe a URL: python3 scripts/generate_qr.py https://seu-dominio.com", file=sys.stderr)
        sys.exit(1)

    try:
        import qrcode
    except ImportError:
        print("Instale: pip3 install qrcode -t .python_libs", file=sys.stderr)
        sys.exit(1)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = qrcode.make(url, box_size=8, border=2)
    img.save(OUT)
    print(f"QR salvo em {OUT}")
    print(f"URL: {url}")


if __name__ == "__main__":
    main()
