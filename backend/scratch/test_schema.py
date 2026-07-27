import os
import sys

# Set python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import google.generativeai as genai

# Find where the module is installed
mod_file = genai.__file__
mod_dir = os.path.dirname(mod_file)
print("SDK module directory:", mod_dir)

# Search for Pydantic to schema conversion references
import inspect
import importlib

# Let's inspect the content_types module
try:
    from google.generativeai.types import content_types
    print("content_types location:", content_types.__file__)
    # Let's read content_types.py and look for schema helpers
    with open(content_types.__file__, 'r', encoding='utf-8') as f:
        code = f.read()
    print("Found 'to_schema' in content_types.py:", 'to_schema' in code)
    print("Found 'Schema' in content_types.py:", 'Schema' in code)
    
    # Print functions in content_types.py
    funcs = []
    for name, obj in inspect.getmembers(content_types):
        if inspect.isfunction(obj):
            funcs.append(name)
    print("Functions in content_types:", funcs)
    
except Exception as e:
    print("Error:", e)
