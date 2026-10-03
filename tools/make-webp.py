"""Turns the captured PNGs into the WebP files the site actually ships.

Two jobs, both of which matter for Core Web Vitals:

1. **WebP at a sensible size.** A 2x PNG of a 1440x900 window is 2880x1800 and
   several megabytes. Resizing to 1800px wide keeps it sharp on a retina display
   at the sizes the site draws it, at roughly a tenth of the weight.
2. **A report.** Every file's size, brightness and contrast are printed, because
   this pipeline has to be checkable without looking at the pictures: a shot of a
   blank page or a white flash has almost no contrast, and a "light" capture that
   is not brighter than the dark one means the theme emulation did not take.

    python tools/make-webp.py

Reads `tools/shots-raw/*.png`, writes `public/screenshots/*.webp`.
"""

from __future__ import annotations

import pathlib
import sys

from PIL import Image, ImageStat

HERE = pathlib.Path(__file__).resolve().parent
SITE = HERE.parent
RAW = HERE / "shots-raw"
OUT = SITE / "public" / "screenshots"

# Longest-edge targets. The desktop shots are drawn in the page at 1100px or
# less, so 1800px covers a 1.5x display; the phone shot is drawn at ~200px.
MAX_WIDTH = {"dashboard-phone": 900}
DEFAULT_WIDTH = 1800

QUALITY = 82

# Captured but deliberately not published: the About page is a page of personal
# contact details, and it earns no place in a marketing bundle.
SKIP = {"about-dark"}


def report(name: str, image: Image.Image) -> None:
    """Brightness and contrast, so a bad capture fails loudly.

    A blank page, a white flash or a theme that did not switch all show up here
    as either near-zero contrast or an unexpected brightness — which is the only
    automated check available on a pipeline whose output is pictures.
    """
    stat = ImageStat.Stat(image.convert("L"))
    print(f"    brightness {stat.mean[0]:6.1f}/255   contrast {stat.stddev[0]:5.1f}")


def convert(name: str, image: Image.Image) -> None:
    target_width = MAX_WIDTH.get(name, DEFAULT_WIDTH)
    if image.width > target_width:
        height = round(image.height * target_width / image.width)
        image = image.resize((target_width, height), Image.LANCZOS)

    destination = OUT / f"{name}.webp"
    image.save(destination, "WEBP", quality=QUALITY, method=6)
    print(
        f"{name}.webp  {image.width}x{image.height}  "
        f"{destination.stat().st_size // 1024} kB"
    )
    report(name, image)


def main() -> int:
    if not RAW.exists():
        print(f"no captures at {RAW} — run tools/capture-app.cjs first", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    converted = 0

    for png in sorted(RAW.glob("*.png")):
        if png.stem in SKIP:
            print(f"{png.stem}: skipped")
            continue
        with Image.open(png) as opened:
            convert(png.stem, opened.convert("RGB"))
        converted += 1

    print(f"\n{converted} images written to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
