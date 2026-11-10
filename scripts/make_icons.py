"""يولّد أيقونات التطبيق (PWA) من شعار الكلية scripts/assets/logo-source.png."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SRC = ROOT / "scripts" / "assets" / "logo-source.png"
NAVY = (20, 40, 75, 255)


def fit(img: Image.Image, size: int) -> Image.Image:
    return img.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    logo = Image.open(SRC).convert("RGBA")
    fit(logo, 256).save(PUBLIC / "logo.png", optimize=True)
    for size in (192, 512):
        fit(logo, size).save(PUBLIC / f"icon-{size}.png", optimize=True)
    # أيقونة قابلة للقص (maskable): الشعار داخل المنطقة الآمنة على خلفية كحلية
    canvas = Image.new("RGBA", (512, 512), NAVY)
    canvas.alpha_composite(fit(logo, 380), (66, 66))
    canvas.save(PUBLIC / "icon-maskable-512.png", optimize=True)
    apple = Image.new("RGBA", (180, 180), NAVY)
    apple.alpha_composite(fit(logo, 150), (15, 15))
    apple.convert("RGB").save(PUBLIC / "apple-touch-icon.png", optimize=True)
    fit(logo, 64).save(PUBLIC / "favicon.png", optimize=True)


if __name__ == "__main__":
    main()
