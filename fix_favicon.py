import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

target = r"""  useEffect\(\(\) => \{
    if \(isLightMode\) \{
      document.documentElement.classList.add\("light-mode"\);
      localStorage.setItem\("codecanvas_theme", "light"\);
    \} else \{
      document.documentElement.classList.remove\("light-mode"\);
      localStorage.setItem\("codecanvas_theme", "dark"\);
    \}
  \}, \[isLightMode\]\);"""

replacement = """  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (isLightMode) {
      document.documentElement.classList.add("light-mode");
      localStorage.setItem("codecanvas_theme", "light");
      if (favicon) favicon.href = "/logo-light.jpg";
    } else {
      document.documentElement.classList.remove("light-mode");
      localStorage.setItem("codecanvas_theme", "dark");
      if (favicon) favicon.href = "/logo.jpg";
    }
  }, [isLightMode]);"""

t = re.sub(target, replacement, t)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
