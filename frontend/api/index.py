import sys
import os
from pathlib import Path

# Add frontend directory to sys.path
frontend_dir = Path(__file__).resolve().parent.parent
if str(frontend_dir) not in sys.path:
    sys.path.insert(0, str(frontend_dir))

# Alias backend_app as app so all internal imports ('from app.routes...', 'from app.core...') succeed
import backend_app
sys.modules["app"] = backend_app

from backend_app.main import app

handler = app
