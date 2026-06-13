reconstruct_path = r"C:\Users\Ayan Hussain\Desktop\speech-coach\frontend\src\app\dashboard\page.tsx"

with open(reconstruct_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

div_depth = 0
curly_depth = 0
paren_depth = 0

for idx in range(880, 1290):
    line = lines[idx-1]
    
    # Count in line
    opens_div = line.count("<div") + line.count("<section")
    closes_div = line.count("</div>") + line.count("</section>")
    opens_curly = line.count("{")
    closes_curly = line.count("}")
    opens_paren = line.count("(")
    closes_paren = line.count(")")
    
    div_depth += opens_div - closes_div
    curly_depth += opens_curly - closes_curly
    paren_depth += opens_paren - closes_paren
    
    if curly_depth < 0 or paren_depth < 0:
        print(f"DEPTH NEGATIVE AT LINE {idx}!")
        print(f"Line {idx}: div_depth={div_depth} | curly_depth={curly_depth} | paren_depth={paren_depth}")
        print(f"Content: {line.strip()}")
        break
