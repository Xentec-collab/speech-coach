import os
import google.generativeai as genai
from google.ai import generativelanguage as glm
from dotenv import load_dotenv

# Load env variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

# Split in case of comma separated (take the first one for this test)
first_key = [k.strip() for k in api_key.split(",") if k.strip()][0]

try:
    print(f"Initializing client with key: {first_key[:10]}...")
    client = glm.GenerativeServiceClient(client_options={'api_key': first_key})
    model = genai.GenerativeModel('gemini-2.5-flash')
    model._client = client
    
    response = model.generate_content("Say hello in one word.")
    print(f"Success! Response: {response.text.strip()}")
except Exception as e:
    print(f"Failed to generate content: {e}")
