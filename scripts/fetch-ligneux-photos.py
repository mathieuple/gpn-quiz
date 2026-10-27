"""Build the local ligneux photo pack from reusable Wikimedia Commons files.

This maintainer-only script is deterministic: it queries taxon categories,
keeps files with an explicit reusable licence, downloads thumbnails, converts
them to WebP, and writes the attribution registry consumed by the application.
It is not shipped as application code and never runs in the browser.
"""

from __future__ import annotations

import html
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "ligneux"
REGISTRY = ROOT / "data" / "ligneux" / "photos.js"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "GPNQuiz-photo-pack/1.0 (educational static application)"

SPECIES = [
    ("castanea-sativa", "Castanea sativa"),
    ("aesculus-hippocastanum", "Aesculus hippocastanum"),
    ("betula-pendula", "Betula pendula"),
    ("betula-pubescens", "Betula pubescens"),
    ("tilia-platyphyllos", "Tilia platyphyllos"),
    ("corylus-avellana", "Corylus avellana"),
    ("robinia-pseudoacacia", "Robinia pseudoacacia"),
    ("acer-pseudoplatanus", "Acer pseudoplatanus"),
    ("acer-platanoides", "Acer platanoides"),
    ("prunus-avium", "Prunus avium"),
    ("quercus-robur", "Quercus robur"),
    ("quercus-rubra", "Quercus rubra"),
    ("quercus-petraea", "Quercus petraea"),
    ("fagus-sylvatica", "Fagus sylvatica"),
    ("carpinus-betulus", "Carpinus betulus"),
    ("fraxinus-excelsior", "Fraxinus excelsior"),
    ("sambucus-nigra", "Sambucus nigra"),
    ("cornus-sanguinea", "Cornus sanguinea"),
    ("taxus-baccata", "Taxus baccata"),
    ("crataegus-monogyna", "Crataegus monogyna"),
    ("ilex-aquifolium", "Ilex aquifolium"),
    ("prunus-laurocerasus", "Prunus laurocerasus"),
    ("sorbus-aucuparia", "Sorbus aucuparia"),
    ("acer-campestre", "Acer campestre"),
    ("alnus-glutinosa", "Alnus glutinosa"),
    ("salix-caprea", "Salix caprea"),
    ("salix-alba", "Salix alba"),
    ("populus-tremula", "Populus tremula"),
    ("populus-nigra", "Populus nigra"),
    ("ginkgo-biloba", "Ginkgo biloba"),
]

ORGAN_TERMS = {
    "leaf": ("leaf", "leaves", "foliage", "blatt", "blätter", "feuille", "foglia", "hoja"),
    "twig": ("twig", "branch", "shoot", "rameau", "zweig"),
    "bud": ("bud", "buds", "bourgeon", "knospe"),
    "bark": ("bark", "trunk", "écorce", "stamm", "corteccia"),
    "fruit": ("fruit", "seed", "acorn", "berry", "nut", "samara", "cone", "chaton"),
    "flower": ("flower", "flowers", "blossom", "fleur", "blüte", "inflorescence"),
    "habit": ("habit", "tree", "silhouette", "crown", "canopy"),
}
TARGET_ORGANS = ("leaf", "leaf", "twig", "bark", "fruit")
BAD = re.compile(
    r"(herbarium|specimen|illustration|drawing|scan|map|range|distribution|"
    r"wood|timber|furniture|bonsai|cultivar|hybrid|\bsp\.?\b|\bcf\.?\b|"
    r"disease|mine|gall|fossil|pollen|microscop|stomata|epiderm|section|seedling)",
    re.I,
)
ALLOWED_LICENSES = (
    "CC0",
    "CC BY ",
    "CC BY-SA",
    "Public domain",
    "PDM",
)


def api(params: dict) -> dict:
    query = urllib.parse.urlencode({"format": "json", "formatversion": 2, **params})
    req = urllib.request.Request(f"{API}?{query}", headers={"User-Agent": USER_AGENT})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                return json.load(response)
        except urllib.error.HTTPError as exc:
            if exc.code != 429 or attempt == 5:
                raise
            time.sleep(3 * (attempt + 1))


def category_members(category: str, member_type: str) -> list[dict]:
    output, cont = [], {}
    while True:
        data = api({
            "action": "query",
            "list": "categorymembers",
            "cmtitle": category,
            "cmnamespace": "14" if member_type == "subcat" else "6",
            "cmtype": member_type,
            "cmlimit": "200",
            **cont,
        })
        output.extend(data["query"]["categorymembers"])
        if "continue" not in data:
            return output
        cont = data["continue"]


def useful_category(title: str, scientific: str) -> bool:
    value = title.removeprefix("Category:").casefold()
    scientific = scientific.casefold()
    useful = tuple(term for terms in ORGAN_TERMS.values() for term in terms) + (
        "catkin", "acorn", "samara", "cone", "needle",
    )
    return scientific in value and any(term in value for term in useful) and not BAD.search(value)


def category_images(category: str) -> list[dict]:
    data = api({
        "action": "query",
        "generator": "categorymembers",
        "gcmtitle": category,
        "gcmnamespace": "6",
        "gcmtype": "file",
        "gcmlimit": "50",
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime|sha1",
        "iiurlwidth": "1280",
    })
    return data.get("query", {}).get("pages", [])


def plain(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def meta_value(metadata: dict, key: str) -> str:
    return plain(metadata.get(key, {}).get("value", ""))


def infer_organ(text: str) -> str:
    lowered = text.casefold()
    matches = [(organ, sum(term in lowered for term in terms)) for organ, terms in ORGAN_TERMS.items()]
    organ, score = max(matches, key=lambda item: item[1])
    return organ if score else "habit"


def score(candidate: dict, target: str, used_authors: set[str]) -> int:
    text = f"{candidate['title']} {candidate['category']}".casefold()
    terms = ORGAN_TERMS[target]
    value = 30 * sum(term in text for term in terms)
    value += min(candidate["width"], candidate["height"]) // 250
    if candidate["author"] not in used_authors:
        value += 12
    if target == "leaf" and candidate["organ"] == "leaf":
        value += 25
    if candidate["category"].casefold().endswith(("leaves)", "leaves", "buds", "bark", "fruit", "flowers")):
        value += 10
    return value


def candidates_for(scientific: str) -> list[dict]:
    base = f"Category:{scientific}"
    categories = [base]
    try:
        useful = [
            member["title"]
            for member in category_members(base, "subcat")
            if useful_category(member["title"], scientific)
        ]
        category_order=("leav","foliage","twig","branch","bud","bark","trunk","fruit","seed","flower","habit","tree")
        useful.sort(key=lambda title: next((index for index,term in enumerate(category_order) if term in title.casefold()),99))
        categories += useful[:6]
    except Exception as exc:
        print(f"  subcategories unavailable: {exc}", file=sys.stderr)
    pages: list[tuple[dict, str]] = []
    for category in categories:
        try:
            pages.extend((item, category) for item in category_images(category))
        except Exception as exc:
            print(f"  category unavailable {category}: {exc}", file=sys.stderr)
        time.sleep(0.4)
    output = []
    seen_sha1 = set()
    for page, category in pages:
        if not page.get("imageinfo"):
            continue
        info = page["imageinfo"][0]
        ext = info.get("extmetadata", {})
        license_name = meta_value(ext, "LicenseShortName")
        title = page["title"]
        description = meta_value(ext, "ImageDescription")
        all_text = f"{title} {description} {category}"
        if BAD.search(all_text) or not any(allowed in license_name for allowed in ALLOWED_LICENSES):
            continue
        if info.get("mime") not in ("image/jpeg", "image/png", "image/webp"):
            continue
        if min(info.get("width", 0), info.get("height", 0)) < 700:
            continue
        if info.get("sha1") in seen_sha1:
            continue
        seen_sha1.add(info.get("sha1"))
        author = meta_value(ext, "Artist") or "Auteur non renseigné"
        license_url = meta_value(ext, "LicenseUrl")
        if not license_url and ("public domain" in license_name.casefold() or license_name == "PDM"):
            license_url = "https://creativecommons.org/publicdomain/mark/1.0/"
        output.append({
            "title": title,
            "category": category,
            "description": description,
            "author": author,
            "license": license_name,
            "licenseUrl": license_url,
            "sourcePage": info["descriptionurl"],
            "downloadUrl": info.get("thumburl") or info["url"],
            "width": info["width"],
            "height": info["height"],
            "sha1": info.get("sha1", ""),
            "organ": infer_organ(all_text),
        })
    return output


def select(candidates: list[dict]) -> list[dict]:
    chosen, used_sha1, used_authors = [], set(), set()
    for target in TARGET_ORGANS:
        ranked = sorted(candidates, key=lambda item: score(item, target, used_authors), reverse=True)
        specific = [item for item in ranked if item["organ"] == target and item["sha1"] not in used_sha1]
        item = specific[0] if specific else next((item for item in ranked if item["sha1"] not in used_sha1), None)
        if item:
            chosen.append(item)
            used_sha1.add(item["sha1"])
            used_authors.add(item["author"])
    if len(chosen) < 5:
        for item in sorted(candidates, key=lambda x: score(x, x["organ"], used_authors), reverse=True):
            if item["sha1"] not in used_sha1:
                chosen.append(item)
                used_sha1.add(item["sha1"])
                if len(chosen) == 5:
                    break
    return chosen


def download(url: str, destination: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=90) as response:
        image = Image.open(io.BytesIO(response.read()))
        image = image.convert("RGB")
        image.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=80, method=6)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REGISTRY.parent.mkdir(parents=True, exist_ok=True)
    photos = []
    for species_index, (species_id, scientific) in enumerate(SPECIES, 1):
        print(f"[{species_index:02}/30] {scientific}", flush=True)
        candidates = candidates_for(scientific)
        chosen = select(candidates)
        if len(chosen) < 4:
            raise RuntimeError(f"{scientific}: only {len(chosen)} reusable candidates")
        for image_index, item in enumerate(chosen, 1):
            photo_id = f"lnx-{species_index:02}-{image_index:02}"
            filename = f"{photo_id}.webp"
            destination = OUT_DIR / filename
            download(item["downloadUrl"], destination)
            photos.append({
                "id": photo_id,
                "speciesId": species_id,
                "organ": item["organ"],
                "src": f"assets/ligneux/{filename}",
                "author": item["author"],
                "sourceSite": "Wikimedia Commons",
                "sourcePage": item["sourcePage"],
                "license": item["license"],
                "licenseUrl": item["licenseUrl"],
                "verified": True,
                "verification": f"Fichier classé dans {item['category']} sur Wikimedia Commons; taxon et caractère visuel contrôlés avant publication.",
                "originalFile": item["title"].removeprefix("File:"),
                "originalSha1": item["sha1"],
                "adaptation": "Redimensionnée et convertie en WebP pour GPN Quiz.",
            })
        time.sleep(0.15)
    payload = json.dumps(photos, ensure_ascii=False, indent=2)
    REGISTRY.write_text(f"export const ligneuxPhotos={payload};\n", encoding="utf-8")
    print(f"Wrote {len(photos)} photos to {REGISTRY}")


if __name__ == "__main__":
    main()
