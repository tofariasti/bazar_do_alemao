#!/usr/bin/env python3
"""Baixa as 6 publicações mais recentes de @bazar_doalemao para a galeria do site."""

import json
import urllib.request
from pathlib import Path

USERNAME = "bazar_doalemao"
APP_ID = "936619743392459"
ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "images" / "instagram"
META_FILE = ROOT / "assets" / "instagram-posts.json"


def main() -> None:
    url = (
        "https://www.instagram.com/api/v1/users/web_profile_info/"
        f"?username={USERNAME}"
    )
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "X-IG-App-ID": APP_ID,
            "X-Requested-With": "XMLHttpRequest",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.load(resp)

    edges = data["data"]["user"]["edge_owner_to_timeline_media"]["edges"][:6]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    posts = []

    for i, edge in enumerate(edges, start=1):
        node = edge["node"]
        shortcode = node["shortcode"]
        image_url = node["display_url"]
        filename = f"post-{i}.jpg"
        path = OUT_DIR / filename

        img_req = urllib.request.Request(
            image_url, headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(img_req, timeout=60) as img_resp:
            path.write_bytes(img_resp.read())

        posts.append(
            {
                "image": f"assets/images/instagram/{filename}",
                "shortcode": shortcode,
            }
        )
        print(f"OK {filename} -> /p/{shortcode}/")

    META_FILE.write_text(
        json.dumps(posts, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Metadados em {META_FILE}")


if __name__ == "__main__":
    main()
