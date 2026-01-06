from PIL import Image
import os
import glob

# Configuration
TARGET_SIZE = (1280, 800)
OUTPUT_DIR = 'extension/screenshots'
INPUT_DIR = 'extension/screenshots_raw' # User needs to put images here first or we assume they are provided in a specific way.
# Since user uploaded images in the chat, I cannot access them directly unless they are saved to disk.
# Assuming the user provided images are in a known location or I need to ask where they are.
# Wait, I see the images in the user query as visual attachments, but I cannot "download" them via code unless they are in the workspace.
# I will assume the user has placed them or I will look for image files in the workspace root.

# Strategy: Look for image files in the workspace root or a likely download folder if accessible.
# Actually, I'll search for recently added image files in the workspace.

def resize_screenshot(image_path, output_name):
    try:
        img = Image.open(image_path)
        
        # Convert to RGB to remove alpha channel (required by store)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None) # Handle transparency
            img = bg
        else:
            img = img.convert('RGB')

        # Resize/Crop to 1280x800
        # To maintain aspect ratio and fill the 1280x800 box, we might need to crop.
        # Calculate target aspect ratio
        target_ratio = TARGET_SIZE[0] / TARGET_SIZE[1]
        img_ratio = img.width / img.height

        if img_ratio > target_ratio:
            # Image is wider than target
            new_height = TARGET_SIZE[1]
            new_width = int(new_height * img_ratio)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            # Crop center
            left = (new_width - TARGET_SIZE[0]) / 2
            img = img.crop((left, 0, left + TARGET_SIZE[0], TARGET_SIZE[1]))
        else:
            # Image is taller/narrower than target
            new_width = TARGET_SIZE[0]
            new_height = int(new_width / img_ratio)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            # Crop center vertical
            top = (new_height - TARGET_SIZE[1]) / 2
            img = img.crop((0, top, TARGET_SIZE[0], top + TARGET_SIZE[1]))

        output_path = os.path.join(OUTPUT_DIR, output_name)
        img.save(output_path, 'JPEG', quality=90)
        print(f"Processed {output_path}")

    except Exception as e:
        print(f"Failed to process {image_path}: {e}")

# Main execution logic will depend on finding the files.
# For now, I'll search for png/jpg files in the root or a 'screenshots' folder if it exists.


