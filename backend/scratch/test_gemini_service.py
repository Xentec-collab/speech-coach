import os
import sys

# Ensure backend directory is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.gemini import generate_speaking_topics

try:
    print("Testing generate_speaking_topics via the actual service module...")
    # Generate 1 impromptu topic
    res = generate_speaking_topics(category="impromptu", difficulty="beginner", count=1)
    print("SUCCESS!")
    print(f"Generated topics: {res.topics}")
except Exception as e:
    print(f"FAILED: {e}")
    sys.exit(1)
