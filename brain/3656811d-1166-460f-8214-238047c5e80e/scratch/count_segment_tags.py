import sys
sys.stdout.reconfigure(encoding='utf-8')

reconstruct_path = r"C:\Users\Ayan Hussain\Desktop\speech-coach\frontend\src\app\dashboard\page.tsx"

with open(reconstruct_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

def count_tags(name, start, end):
    segment_lines = lines[start-1 : end]
    text = "".join(segment_lines)
    opens = text.count("<div") + text.count("<section") + text.count("<main") + text.count("<nav") + text.count("<form") + text.count("<ul") + text.count("<li") + text.count("<ol") + text.count("<button") + text.count("<audio") + text.count("<span") + text.count("<h1") + text.count("<h2") + text.count("<h3") + text.count("<h4") + text.count("<h5") + text.count("<h6") + text.count("<select") + text.count("<option") + text.count("<table") + text.count("<thead") + text.count("<tbody") + text.count("<th") + text.count("<td") + text.count("<tr")
    closes = text.count("</div>") + text.count("</section>") + text.count("</main>") + text.count("</nav>") + text.count("</form>") + text.count("</ul>") + text.count("</li>") + text.count("</ol>") + text.count("</button>") + text.count("</audio>") + text.count("</span>") + text.count("</h1>") + text.count("</h2>") + text.count("</h3>") + text.count("</h4>") + text.count("</h5>") + text.count("</h6>") + text.count("</select>") + text.count("</option>") + text.count("</table>") + text.count("</thead>") + text.count("</tbody>") + text.count("</th>") + text.count("</td>") + text.count("</tr>")
    
    opens += text.count("<svg") + text.count("<circle") + text.count("<line") + text.count("<path") + text.count("<defs") + text.count("<linearGradient") + text.count("<stop") + text.count("<text") + text.count("<g")
    closes += text.count("</svg>") + text.count("</circle>") + text.count("</line>") + text.count("</path>") + text.count("</defs>") + text.count("</linearGradient>") + text.count("</stop>") + text.count("</text>") + text.count("</g>")
    
    open_curlies = text.count("{")
    close_curlies = text.count("}")
    print(f"Segment: {name} (lines {start} to {end})")
    print(f"  HTML: {opens} / {closes} (diff: {opens - closes})")
    print(f"  {{ / }}: {open_curlies} / {close_curlies} (diff: {open_curlies - close_curlies})")
    print()

count_tags("Scorecard", 899, 1125)
count_tags("Placeholder", 1128, 1132)
count_tags("Banner", 1136, 1142)
count_tags("Recording", 1144, 1271)
