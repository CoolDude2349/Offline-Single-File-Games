import os
import base64
import mimetypes
import json
import sys


input_folder = "folder"  # Place your folder where all assets are here
output_js_file = "dataURIs.js"  
exclude_extensions = {'.tmp', '.ds_store', '.bak'}
exclude_filenames = {'Thumbs.db', 'desktop.ini'}



def is_valid_file(filepath):
    name = os.path.basename(filepath).lower()
    ext = os.path.splitext(name)[1].lower()
    if name in exclude_filenames:
        print(f"Skipped (excluded filename): {filepath}")
        return False
    if ext in exclude_extensions:
        print(f"Skipped (excluded extension): {filepath}")
        return False
    return True

def get_all_files(folder):
    for root, _, files in os.walk(folder):
        for f in files:
            full_path = os.path.join(root, f)
            print(f"Found file: {full_path}")
            if is_valid_file(full_path):
                yield full_path

def file_to_data_uri(filepath):
    mime_type, _ = mimetypes.guess_type(filepath)
    if not mime_type:
        mime_type = "application/octet-stream"
    with open(filepath, "rb") as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
    return f"data:{mime_type};base64,{encoded}"

def format_js_object(obj):
    return "const dataURIs = " + json.dumps(obj, indent=2) + ";"

def main():
    if not os.path.isdir(input_folder):
        print(f"Error: Input folder '{input_folder}' does not exist.")
        sys.exit(1)

    file_map = {}
    seen_filenames = set()
    file_count = 0
    skipped_duplicates = 0

    for filepath in get_all_files(input_folder):
        filename = os.path.basename(filepath)
        if filename in seen_filenames:
            print(f"Duplicate filename: {filename} (from {filepath}) — script will exit.")
            sys.exit(1)
        try:
            data_uri = file_to_data_uri(filepath)
            file_map[filename] = data_uri
            seen_filenames.add(filename)
            file_count += 1
            print(f"Encoded: {filename}")
        except Exception as e:
            print(f"Failed to encode {filename}: {e}")

    js_content = format_js_object(file_map)
    with open(output_js_file, "w", encoding="utf-8") as out:
        out.write(js_content)

    print(f"\nTotal files encoded: {file_count}")
    print(f"Output written to: {output_js_file}")

if __name__ == "__main__":
    main()
