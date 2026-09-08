import re

with open('frontend/client/src/components/HomePage.jsx', 'r') as f:
    t = f.read()

# Add isLightMode state
if "const [isLightMode, setIsLightMode]" not in t:
    t = t.replace(
        "export default function HomePage() {",
        "export default function HomePage() {\n  const [isLightMode, setIsLightMode] = useState(localStorage.getItem('codecanvas_theme') === 'light');\n\n  useEffect(() => {\n    const handleThemeChange = () => setIsLightMode(localStorage.getItem('codecanvas_theme') === 'light');\n    window.addEventListener('storage', handleThemeChange);\n    return () => window.removeEventListener('storage', handleThemeChange);\n  }, []);\n"
    )

# Replace the logo logic in the header
target = r'<img src="/logo\.jpg" className="logo-img w-9 h-9 rounded-xl shadow-\[0_0_20px_rgba\(168,85,247,0\.3\)\] border border-white/10" />'
replacement = r'<img src={isLightMode ? "/logo-light.jpg" : "/logo.jpg"} className="logo-img w-9 h-9 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/10" />'

t = re.sub(target, replacement, t)

with open('frontend/client/src/components/HomePage.jsx', 'w') as f:
    f.write(t)
