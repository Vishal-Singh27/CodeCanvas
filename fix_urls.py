import os
import re

files = [
    'frontend/client/src/components/LoginCallback.jsx',
    'frontend/client/src/components/HomePage.jsx',
    'frontend/client/src/components/Dashboard.jsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Replace single quotes
    content = re.sub(
        r"'http://localhost:5001/api/(.*?)'",
        r"`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/\1`",
        content
    )
    # Replace double quotes
    content = re.sub(
        r'"http://localhost:5001/api/(.*?)"',
        r"`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/\1`",
        content
    )
    # Replace backticks (already inside template literals)
    # E.g. `http://localhost:5001/api/github/repos/${username}` -> `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/github/repos/${username}`
    content = re.sub(
        r"`http://localhost:5001/api/(.*?)`",
        r"`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/\1`",
        content
    )

    with open(file, 'w') as f:
        f.write(content)
