filename = "Your file name.html"
num_parts = 3  

with open(filename, 'r', encoding='utf-8') as file:
    html = file.read()

chunk_size = len(html) // num_parts + (1 if len(html) % num_parts != 0 else 0)

for i in range(0, len(html), chunk_size):
    part = html[i:i+chunk_size]
    with open(f"part_{i//chunk_size + 1}.txt", "w", encoding='utf-8') as f:
        f.write(part)
