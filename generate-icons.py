#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

sizes = [16, 32, 48, 128]
icons_dir = 'icons'

if not os.path.exists(icons_dir):
    os.makedirs(icons_dir)

for size in sizes:
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background rounded rectangle with gradient effect
    # Draw multiple layers for gradient simulation
    corner_radius = size // 8
    
    # Dark blue background
    draw.rounded_rectangle(
        [(0, 0), (size-1, size-1)],
        radius=corner_radius,
        fill=(26, 58, 82, 255)  # #1a3a52
    )
    
    # Draw stacked cards effect (Rolodex cards)
    card_height = size // 8
    card_width = int(size * 0.6)
    start_x = (size - card_width) // 2
    
    # Draw 4 cards with decreasing opacity
    opacities = [230, 179, 128, 77]  # 0.9, 0.7, 0.5, 0.3 * 255
    for i, opacity in enumerate(opacities):
        y_pos = size // 3 + i * (card_height + 2)
        if y_pos + card_height > size - 5:
            break
        draw.rounded_rectangle(
            [(start_x, y_pos), (start_x + card_width, y_pos + card_height)],
            radius=max(2, size // 40),
            fill=(77, 208, 225, opacity)  # #4dd0e1 with varying opacity
        )
    
    # Save as PNG
    filename = os.path.join(icons_dir, f'icon{size}.png')
    img.save(filename, 'PNG')
    print(f'✓ Created icon{size}.png')

print('\n✨ PNG icons generated!')
