import os
import math
from PIL import Image, ImageDraw

def transform_pt(x, y, scale, ox, oy):
    return (ox + x * scale, oy + y * scale)

def create_brand_icon(size=512, is_adaptive=False):
    # 4x supersampling for razor sharp anti-aliasing
    scale_factor = 4
    canvas_size = size * scale_factor
    
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    brand_color = (91, 79, 224, 255)       # #5B4FE0
    white = (255, 255, 255, 255)
    
    if not is_adaptive:
        # Full bleed badge with smooth rounded corners
        padding = int(canvas_size * 0.015)
        corner_radius = int(canvas_size * 0.22)
        box = [padding, padding, canvas_size - padding, canvas_size - padding]
        draw.rounded_rectangle(box, radius=corner_radius, fill=brand_color)
    
    # 24x24 Lucide coordinate mapping to canvas
    # Target icon box: center 88% of canvas for maximum tab visibility and zero wasted space
    target_dim = canvas_size * 0.86
    s = target_dim / 24.0
    ox = (canvas_size - 24.0 * s) / 2.0
    oy = (canvas_size - 24.0 * s) / 2.0 + (canvas_size * 0.01)  # centered
    stroke_w = int(2.55 * s)
    
    # 1. Diamond Mortarboard (bold, wide, crisp)
    diamond_raw = [
        (12.0, 4.2),
        (22.2, 9.6),
        (12.0, 15.0),
        (1.8, 9.6),
    ]
    diamond_pts = [transform_pt(x, y, s, ox, oy) for x, y in diamond_raw]
    
    # Draw thick diamond with rounded line caps/joins
    for i in range(len(diamond_pts)):
        p1 = diamond_pts[i]
        p2 = diamond_pts[(i + 1) % len(diamond_pts)]
        draw.line([p1, p2], fill=white, width=stroke_w)
        draw.ellipse([p1[0] - stroke_w/2, p1[1] - stroke_w/2, p1[0] + stroke_w/2, p1[1] + stroke_w/2], fill=white)
    
    # 2. Cap Base Arc (skullcap under mortarboard)
    arc_points = []
    # Left vertical down: from y=12.2 to y=15.2
    for step in range(20):
        y_val = 12.2 + (15.2 - 12.2) * (step / 20.0)
        arc_points.append(transform_pt(5.5, y_val, s, ox, oy))
    
    # Arc from angle math.pi (left) to 0 (right), center at (12.0, 15.2), rx=6.5, ry=3.8
    for step in range(100):
        angle = math.pi - (math.pi * step / 100.0)
        x_val = 12.0 + 6.5 * math.cos(angle)
        y_val = 15.2 + 3.8 * math.sin(angle)
        arc_points.append(transform_pt(x_val, y_val, s, ox, oy))
    
    # Right vertical up: from y=15.2 to y=12.2
    for step in range(21):
        y_val = 15.2 - (15.2 - 12.2) * (step / 20.0)
        arc_points.append(transform_pt(18.5, y_val, s, ox, oy))
    
    # Draw arc curve
    for i in range(len(arc_points) - 1):
        p1 = arc_points[i]
        p2 = arc_points[i + 1]
        draw.line([p1, p2], fill=white, width=stroke_w)
        draw.ellipse([p1[0] - stroke_w/2, p1[1] - stroke_w/2, p1[0] + stroke_w/2, p1[1] + stroke_w/2], fill=white)
    
    # 3. Tassel (bold line + clean bob)
    tassel_top = transform_pt(22.2, 9.6, s, ox, oy)
    tassel_bot = transform_pt(22.2, 16.2, s, ox, oy)
    draw.line([tassel_top, tassel_bot], fill=white, width=int(stroke_w * 0.85))
    # Tassel bob
    bob_r = stroke_w * 0.75
    draw.ellipse([
        tassel_bot[0] - bob_r, tassel_bot[1] - bob_r * 0.4,
        tassel_bot[0] + bob_r, tassel_bot[1] + bob_r * 1.6
    ], fill=white)
    
    # Final downsample with high-quality Lanczos filter
    return img.resize((size, size), Image.Resampling.LANCZOS)

def create_svg_favicon():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="#5B4FE0"/>
  <path d="M28.5 12.8L16 6.8L3.5 12.8L16 18.8L28.5 12.8Z" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 15.8V19.2C8 23.6 24 23.6 24 19.2V15.8" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28.5 12.8V20.5" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="28.5" cy="21" r="1.8" fill="#FFFFFF"/>
</svg>'''

def main():
    os.makedirs('assets', exist_ok=True)
    os.makedirs('dist', exist_ok=True)
    
    # 1. Main app icon (512x512)
    icon_512 = create_brand_icon(512)
    icon_512.save('assets/icon.png', 'PNG')
    print('Generated assets/icon.png')
    
    # 2. Favicon (512x512 high res PNG)
    favicon_512 = create_brand_icon(512)
    favicon_512.save('assets/favicon.png', 'PNG')
    favicon_512.save('dist/favicon.png', 'PNG')
    print('Generated assets/favicon.png & dist/favicon.png')
    
    # 3. Adaptive Icon for Android (512x512)
    adaptive_512 = create_brand_icon(512, is_adaptive=False)
    adaptive_512.save('assets/adaptive-icon.png', 'PNG')
    print('Generated assets/adaptive-icon.png')
    
    # 4. SVG Favicon for modern browsers
    svg_content = create_svg_favicon()
    with open('assets/favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    with open('dist/favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print('Generated assets/favicon.svg & dist/favicon.svg')
    
    # 5. Multi-resolution ICO for legacy & browser tabs (16, 32, 48, 64, 128, 256)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_images = [create_brand_icon(s[0]) for s in ico_sizes]
    
    ico_images[0].save(
        'dist/favicon.ico',
        format='ICO',
        sizes=ico_sizes,
        append_images=ico_images[1:]
    )
    ico_images[0].save(
        'assets/favicon.ico',
        format='ICO',
        sizes=ico_sizes,
        append_images=ico_images[1:]
    )
    print('Generated dist/favicon.ico & assets/favicon.ico')

if __name__ == '__main__':
    main()
