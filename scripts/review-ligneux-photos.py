"""Create contact sheets for the maintainer's visual taxon review."""
from pathlib import Path
from PIL import Image, ImageDraw

SPECIES = [
    "Castanea sativa","Aesculus hippocastanum","Betula pendula","Betula pubescens","Tilia platyphyllos",
    "Corylus avellana","Robinia pseudoacacia","Acer pseudoplatanus","Acer platanoides","Prunus avium",
    "Quercus robur","Quercus rubra","Quercus petraea","Fagus sylvatica","Carpinus betulus",
    "Fraxinus excelsior","Sambucus nigra","Cornus sanguinea","Taxus baccata","Crataegus monogyna",
    "Ilex aquifolium","Prunus laurocerasus","Sorbus aucuparia","Acer campestre","Alnus glutinosa",
    "Salix caprea","Salix alba","Populus tremula","Populus nigra","Ginkgo biloba",
]
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "ligneux"
OUTPUT = ROOT / ".tmp-ligneux-review"
OUTPUT.mkdir(exist_ok=True)

for group in range(6):
    sheet = Image.new("RGB", (1250, 1100), "white")
    draw = ImageDraw.Draw(sheet)
    for row in range(5):
        index = group * 5 + row
        draw.text((10, row * 220 + 5), f"{index + 1:02} {SPECIES[index]}", fill="black")
        for column in range(5):
            path = SOURCE / f"lnx-{index + 1:02}-{column + 1:02}.webp"
            if not path.exists():
                continue
            image = Image.open(path).convert("RGB")
            image.thumbnail((220, 175))
            tile = Image.new("RGB", (220, 175), "#dddddd")
            tile.paste(image, ((220 - image.width) // 2, (175 - image.height) // 2))
            sheet.paste(tile, (10 + column * 245, row * 220 + 30))
            draw.text((10 + column * 245, row * 220 + 207), path.stem, fill="black")
    sheet.save(OUTPUT / f"review-{group + 1}.jpg", quality=90)
print(OUTPUT)
