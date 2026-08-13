import sys, os
sys.path.insert(0, os.path.abspath("."))

from app.routes.user import get_user_profile

mock_user = {
    "id": "c578a809-b615-4f67-bb46-3ad3f236fbf5",
    "email": "ayanhusain2907@gmail.com",
    "user_metadata": {"full_name": "Ayan Husain"},
    "is_super_user": True,
}

res = get_user_profile(current_user=mock_user)
print("Profile Result:", res)
assert res["is_superuser"] is True, "Expected is_superuser to be True"
print("Superuser verification PASSED!")
