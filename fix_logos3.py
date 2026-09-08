import re

# Update Dashboard
with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

# Line 860
t = re.sub(r'src="/logo\.jpg"\s+alt="CodeCanvas Logo"', r'src={isLightMode ? "/logo-light.jpg" : "/logo.jpg"}\n              alt="CodeCanvas Logo"', t)

# Line 1222
t = re.sub(r'<img src="/logo\.jpg" className="invert dark:invert-0 transition-all duration-300 ', r'<img src={isLightMode ? "/logo-light.jpg" : "/logo.jpg"} className="transition-all duration-300 ', t)
# In case it didn't match the invert class properly:
t = re.sub(r'<img src="/logo\.jpg" className="w-24 h-24 mb-6', r'<img src={isLightMode ? "/logo-light.jpg" : "/logo.jpg"} className="w-24 h-24 mb-6', t)


with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)


# Update HomePage
with open('frontend/client/src/components/HomePage.jsx', 'r') as f:
    t = f.read()

t = re.sub(r'<img src="/logo\.jpg".+?className="w-9 h-9', r'<img src={localStorage.getItem("codecanvas_theme") === "light" ? "/logo-light.jpg" : "/logo.jpg"} className="w-9 h-9', t)
# Also there is a bigger logo somewhere?
t = re.sub(r'<img src="/logo\.jpg".+?className="w-20 h-20', r'<img src={localStorage.getItem("codecanvas_theme") === "light" ? "/logo-light.jpg" : "/logo.jpg"} className="w-20 h-20', t)

with open('frontend/client/src/components/HomePage.jsx', 'w') as f:
    f.write(t)
