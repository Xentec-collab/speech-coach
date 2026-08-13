import sys
import os
sys.path.insert(0, os.path.abspath("."))

from app.routes.speeches import list_user_speeches

mock_user = {
    "id": "c578a809-b615-4f67-bb46-3ad3f236fbf5",
    "email": "ayanhusain2907@gmail.com",
    "user_metadata": {"full_name": "Local Developer"},
    "is_super_user": True,
}

try:
    res = list_user_speeches(page=1, limit=20, type=None, current_user=mock_user)
    print("SUCCESS! Fetched:", len(res), "items")
except Exception as e:
    import traceback
    print("ERROR OCCURRED:")
    traceback.print_exc()
