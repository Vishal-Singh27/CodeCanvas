import re

with open('frontend/client/src/components/HomePage.jsx', 'r') as f:
    t = f.read()

# Add imports
if "useState" not in t:
    t = t.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';")

# Add state
if "const [isLightMode" not in t:
    t = t.replace(
        "const HomePage = () => {",
        "const HomePage = () => {\n  const [isLightMode, setIsLightMode] = useState(localStorage.getItem('codecanvas_theme') === 'light');\n\n  useEffect(() => {\n    const handleThemeChange = () => setIsLightMode(localStorage.getItem('codecanvas_theme') === 'light');\n    window.addEventListener('storage', handleThemeChange);\n    return () => window.removeEventListener('storage', handleThemeChange);\n  }, []);\n"
    )

with open('frontend/client/src/components/HomePage.jsx', 'w') as f:
    f.write(t)
