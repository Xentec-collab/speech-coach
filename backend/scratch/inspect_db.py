import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("c:/Users/Ayan Hussain/Desktop/speech-coach/backend/.env")
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"Supabase URL: {url}")
supabase: Client = create_client(url, key)

try:
    # Try selecting from speeches
    res = supabase.table("speeches").select("id").limit(1).execute()
    print("Speeches table exists.")
except Exception as e:
    print(f"Speeches table check failed: {e}")

try:
    # Try selecting from topics
    res = supabase.table("topics").select("id").limit(1).execute()
    print("Topics table exists.")
except Exception as e:
    print(f"Topics table check failed: {e}")

try:
    # Try selecting from user_subscriptions
    res = supabase.table("user_subscriptions").select("user_id").limit(1).execute()
    print("user_subscriptions table exists.")
except Exception as e:
    print(f"user_subscriptions table check failed: {e}")
