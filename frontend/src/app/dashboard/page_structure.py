with open(r"c:\Users\Ayan Hussain\Desktop\speech-coach\frontend\src\app\dashboard\page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Let's find some key functions
for idx, line in enumerate(lines):
    if "const render" in line or "function " in line or "return (" in line:
        print(f"Line {idx+1}: {line.strip()}")
