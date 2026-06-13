import os
import random
import google.generativeai as genai
from google.ai import generativelanguage as glm
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Simulate a comma-separated key string: "INVALID_KEY_1, INVALID_KEY_2, VALID_KEY"
real_key = os.getenv("GEMINI_API_KEY")
if not real_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

# Grab the first valid key from .env (just in case they already have comma separated there)
valid_key = [k.strip() for k in real_key.split(",") if k.strip()][0]

# Construct our test keys: two invalid keys and one valid key
test_keys_str = f"AIzaSyFakeKeyOneXXX, {valid_key}, AIzaSyFakeKeyTwoYYY"

def test_call_generative_model(contents, primary_model="gemini-2.5-flash", fallback_model="gemini-3.1-flash-lite"):
    keys = [k.strip() for k in test_keys_str.split(",") if k.strip()]
    
    # Shuffle keys to distribute traffic randomly
    shuffled_keys = list(keys)
    random.shuffle(shuffled_keys)
    
    print(f"Keys to try (shuffled): {[k[:10] + '...' for k in shuffled_keys]}")
    
    last_error = None
    # ── Try primary model with rotated keys ──────────────────────────────────
    for i, key in enumerate(shuffled_keys):
        try:
            print(f"Attempting primary model {primary_model} with key: {key[:10]}...")
            client = glm.GenerativeServiceClient(client_options={'api_key': key})
            model = genai.GenerativeModel(primary_model)
            model._client = client
            
            res = model.generate_content(contents)
            print(f"SUCCESS with key {key[:10]}!")
            return res
        except Exception as e:
            last_error = e
            print(f"Failed with key {key[:10]}: {e}. Trying next key...")
            continue
            
    # ── Fallback to lite model with rotated keys ──────────────────────────────
    print(f"All keys failed on primary model {primary_model}. Attempting fallback to {fallback_model}...")
    for i, key in enumerate(shuffled_keys):
        try:
            print(f"Attempting fallback model {fallback_model} with key: {key[:10]}...")
            client = glm.GenerativeServiceClient(client_options={'api_key': key})
            model = genai.GenerativeModel(fallback_model)
            model._client = client
            
            res = model.generate_content(contents)
            print(f"SUCCESS with fallback key {key[:10]}!")
            return res
        except Exception as e:
            last_error = e
            print(f"Failed with fallback key {key[:10]}: {e}. Trying next key...")
            continue
            
    raise last_error if last_error else RuntimeError("All Gemini API keys failed.")

# Run the test
try:
    response = test_call_generative_model("Say hello in one word.")
    print(f"Test result response text: {response.text.strip()}")
except Exception as e:
    print(f"Test failed completely: {e}")
