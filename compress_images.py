import os
from PIL import Image
import subprocess

def compress_image(input_path, output_path, max_size_kb=150):
    quality = 90
    size_reduction_factor = 0.9

    img = Image.open(input_path)
    initial_size_kb = os.path.getsize(input_path) / 1024
    
    # Only compress if the image size exceeds the max size limit
    if initial_size_kb > max_size_kb:
        while os.path.getsize(input_path) / 1024 > max_size_kb and quality > 10:
            try:
                img = img.resize((int(img.width * size_reduction_factor), int(img.height * size_reduction_factor)), Image.ANTIALIAS)
                img.save(output_path, optimize=True, quality=quality)
                quality -= 10
            except Exception as e:
                print(f"Error compressing {input_path}: {e}")
                break
        img.save(output_path, optimize=True, quality=quality)
        
        # # Further optimize using optipng
        # subprocess.run(['optipng', '-o7', '-strip', 'all', '-quiet', output_path], cwd=os.path.dirname(output_path))
        
        # Check if the size is still larger than max_size_kb after optipng
        # if os.path.getsize(output_path) / 1024 > max_size_kb:
        #     # Further compress using pngquant
        #     subprocess.run(['pngquant', '--quality=65-80', '--output', output_path, '--force', output_path])

        final_size_kb = os.path.getsize(output_path) / 1024
        return final_size_kb
        # print("needs compression" ,initial_size_kb)
        # return initial_size_kb
    else:
        # If image is already within the size limit, just copy it
        img.save(output_path, optimize=True, quality=quality)
        # print("does not" ,initial_size_kb)
        
        return initial_size_kb

def compress_images_in_folder(folder_path, max_size_kb=150):
    # folder_path = os.path.join(folder_path, "images")
    # print(folder_path)
    output_folder = os.path.join(folder_path, 'compressed_imgs')
    
    list = []
    for file_name in os.listdir(folder_path):
        list.append(file_name)
    
    # print(list)
    os.makedirs(output_folder, exist_ok=True)
    for file_name in list:
        input_path = os.path.join(folder_path, file_name)
        if os.path.isfile(input_path) and input_path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            output_path = os.path.join(output_folder, f"{os.path.splitext(file_name)[0]}.png")
            print(input_path, output_path)
            final_size_kb = compress_image(input_path, output_path, max_size_kb)
            print(f"Compressed {input_path} from {(os.path.getsize(input_path) / 1024):2f} to {final_size_kb:.2f} KB")

def print_all_folders(base_folder):
    print(base_folder)
    folders = []
    for x in os.walk(base_folder) :
        if x[0].endswith('\images'): 
                # print(x[0])
                folders.append(x[0])
    # print(folders)
    for folder in folders:
        compress_images_in_folder(folder)

# Example usage
base_folder = 'structures'  # Replace with the path to your base folder
print_all_folders(base_folder)
