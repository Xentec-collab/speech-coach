import sys
sys.stdout.reconfigure(encoding='utf-8')

reconstruct_path = r"C:\Users\Ayan Hussain\Desktop\speech-coach\frontend\src\app\dashboard\page.tsx"

with open(reconstruct_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

div_depth = 0
curly_depth = 0
paren_depth = 0

for idx in range(1, len(lines) + 1):
    line = lines[idx-1]
    
    # Count in line
    opens_div = line.count("<div") + line.count("<section") + line.count("<main") + line.count("<nav") + line.count("<form") + line.count("<ul") + line.count("<li") + line.count("<ol") + line.count("<button") + line.count("<audio") + line.count("<span") + line.count("<h1") + line.count("<h2") + line.count("<h3") + line.count("<h4") + line.count("<h5") + line.count("<h6") + line.count("<select") + line.count("<option") + line.count("<table") + line.count("<thead") + line.count("<tbody") + line.count("<th") + line.count("<td") + line.count("<tr")
    closes_div = line.count("</div>") + line.count("</section>") + line.count("</main>") + line.count("</nav>") + line.count("</form>") + line.count("</ul>") + line.count("</li>") + line.count("</ol>") + line.count("</button>") + line.count("</audio>") + line.count("</span>") + line.count("</h1>") + line.count("</h2>") + line.count("</h3>") + line.count("</h4>") + line.count("</h5>") + line.count("</h6>") + line.count("</select>") + line.count("</option>") + line.count("</table>") + line.count("</thead>") + line.count("</tbody>") + line.count("</th>") + line.count("</td>") + line.count("</tr>")
    
    # Handle self-closing elements (like <input />, <circle />, <line />, <path />, <defs />, <svg>, <circle>, <line>, <path>, <rect>, <text>, <g>, <linearGradient>, <stop>)
    # Note: we should count <svg>, <circle>, <line>, <path>, <defs>, <linearGradient>, <stop>, <text>, <g> and their closing tags
    opens_div += line.count("<svg") + line.count("<circle") + line.count("<line") + line.count("<path") + line.count("<defs") + line.count("<linearGradient") + line.count("<stop") + line.count("<text") + line.count("<g")
    closes_div += line.count("</svg>") + line.count("</circle>") + line.count("</line>") + line.count("</path>") + line.count("</defs>") + line.count("</linearGradient>") + line.count("</stop>") + line.count("</text>") + line.count("</g>")
    
    opens_curly = line.count("{")
    closes_curly = line.count("}")
    opens_paren = line.count("(")
    closes_paren = line.count(")")
    
    div_depth += opens_div - closes_div
    curly_depth += opens_curly - closes_curly
    paren_depth += opens_paren - closes_paren
    
    if idx > 1250:
        print(f"Line {idx:4d}: div={div_depth:2d} | curly={curly_depth:2d} | paren={paren_depth:2d} | {line.strip()}")

print("-" * 50)
print(f"FINAL DEPTHS: div_depth={div_depth} | curly_depth={curly_depth} | paren_depth={paren_depth}")
