import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

# Fix isLightMode initialization
t = re.sub(
    r'const \[isLightMode, setIsLightMode\] = useState\(false\);',
    r'const [isLightMode, setIsLightMode] = useState(localStorage.getItem("codecanvas_theme") === "light");',
    t
)

# Fix isLightMode useEffect to save to localStorage
new_effect = """  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("codecanvas_theme", "light");
    } else {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("codecanvas_theme", "dark");
    }
  }, [isLightMode]);"""

t = re.sub(
    r'  useEffect\(\(\) => \{\s*if \(isLightMode\) \{\s*document\.documentElement\.classList\.add\("light-mode"\);\s*\} else \{\s*document\.documentElement\.classList\.remove\("light-mode"\);\s*\}\s*\}, \[isLightMode\]\);',
    new_effect,
    t
)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
