#!/usr/bin/env python3
"""Remove fundo branco do logo (flood fill nas bordas). Preserva branco interno do design."""

from __future__ import annotations

import shutil
import sys
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "assets" / "images" / "logo.png"
BACKUP = ROOT / "assets" / "images" / "logo.backup.png"


def main() -> None:
    try:
        from PIL import Image
    except ImportError:
        print("Instale Pillow: pip3 install Pillow -t .python_libs", file=sys.stderr)
        sys.exit(1)

    if not LOGO.exists():
        print(f"Arquivo não encontrado: {LOGO}", file=sys.stderr)
        sys.exit(1)

    if not BACKUP.exists():
        shutil.copy(LOGO, BACKUP)

    img = Image.open(LOGO).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    def is_bg(r: int, g: int, b: int, a: int, tol: int = 30) -> bool:
        if a < 25:
            return True
        return r >= 255 - tol and g >= 255 - tol and b >= 255 - tol

    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if not visited[y][x] and is_bg(*pixels[x, y]):
                visited[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visited[y][x] and is_bg(*pixels[x, y]):
                visited[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and is_bg(*pixels[nx, ny]):
                visited[ny][nx] = True
                q.append((nx, ny))

    removed = 0
    for y in range(h):
        for x in range(w):
            if visited[y][x]:
                pixels[x, y] = (0, 0, 0, 0)
                removed += 1

    img.save(LOGO, "PNG")
    print(f"Logo salvo com transparência ({removed} pixels removidos).")
    print(f"Backup: {BACKUP}")


if __name__ == "__main__":
    main()
