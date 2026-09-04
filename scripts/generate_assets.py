import os
from PIL import Image, ImageDraw

BRAND_BLUE_HEX = "#386AEB"
BRAND_BLUE_RGB = (56, 106, 235, 255)

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    icon_src_path = os.path.join(root_dir, 'icon.png')
    fg_src_path = os.path.join(root_dir, 'android-icon-foreground.png')

    assets_dir = os.path.join(root_dir, 'assets')
    public_dir = os.path.join(root_dir, 'public')
    dist_dir = os.path.join(root_dir, 'dist')

    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(public_dir, exist_ok=True)
    os.makedirs(dist_dir, exist_ok=True)

    # 1. Open Source Images
    im_icon = Image.open(icon_src_path).convert('RGBA')
    im_fg = Image.open(fg_src_path).convert('RGBA')

    # Apply circular mask to icon.png to eliminate white corner squares
    w, h = im_icon.size
    cx, cy = 511.0, 511.0
    radius = 352.0

    mask = Image.new('L', (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=255)

    icon_clean = im_icon.copy()
    icon_clean.putalpha(mask)

    # 2. Main app icon: assets/icon.png (1024x1024)
    icon_clean.save(os.path.join(assets_dir, 'icon.png'), 'PNG', optimize=True)
    print('Generated assets/icon.png')

    # 3. Android Adaptive Icon Foreground: assets/adaptive-icon.png (1024x1024)
    im_fg.save(os.path.join(assets_dir, 'adaptive-icon.png'), 'PNG', optimize=True)
    print('Generated assets/adaptive-icon.png')

    # 4. Splash Screen: 1024x1024 with #386AEB blue background and centered cap logo
    splash = Image.new('RGBA', (1024, 1024), BRAND_BLUE_RGB)
    splash.alpha_composite(im_fg)
    splash.save(os.path.join(assets_dir, 'splash.png'), 'PNG', optimize=True)
    print('Generated assets/splash.png')

    # 5. Web Favicon PNG (512x512)
    fav_512 = icon_clean.resize((512, 512), Image.Resampling.LANCZOS)
    fav_512.save(os.path.join(assets_dir, 'favicon.png'), 'PNG')
    fav_512.save(os.path.join(public_dir, 'favicon.png'), 'PNG')
    fav_512.save(os.path.join(dist_dir, 'favicon.png'), 'PNG')
    print('Generated favicon.png in assets, public, and dist')

    # 6. Web icon.png
    fav_512.save(os.path.join(public_dir, 'icon.png'), 'PNG')
    fav_512.save(os.path.join(dist_dir, 'icon.png'), 'PNG')
    print('Generated icon.png in public and dist')

    # 7. Multi-resolution ICO (16, 32, 48, 64, 128, 256)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_images = [icon_clean.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
    for dest in [assets_dir, public_dir, dist_dir]:
        ico_images[0].save(
            os.path.join(dest, 'favicon.ico'),
            format='ICO',
            sizes=ico_sizes,
            append_images=ico_images[1:]
        )
    print('Generated favicon.ico in assets, public, and dist')

    # 8. SVG Favicon with the blue shade
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="{BRAND_BLUE_HEX}"/>
  <path d="M28.5 12.8L16 6.8L3.5 12.8L16 18.8L28.5 12.8Z" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 15.8V19.2C8 23.6 24 23.6 24 19.2V15.8" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28.5 12.8V20.5" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="28.5" cy="21" r="1.8" fill="#FFFFFF"/>
</svg>'''

    for dest in [assets_dir, public_dir, dist_dir]:
        with open(os.path.join(dest, 'favicon.svg'), 'w', encoding='utf-8') as f:
            f.write(svg_content)
    print('Generated favicon.svg in assets, public, and dist')

if __name__ == '__main__':
    main()
