import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

target = r'<div className={`absolute inset-0 z-50 bg-\[#121212\] md:bg-transparent px-4 md:px-0 flex items-center md:relative md:w-48 lg:w-64 md:flex \$\{isSearchExpanded \? \\\'flex\\\' : \\\'hidden\\\'\}`}'
replacement = r'<div className={`absolute inset-0 z-50 bg-[#121212] md:bg-transparent px-4 md:px-0 flex items-center md:relative md:w-48 lg:w-64 md:flex ${isSearchExpanded ? "flex" : "hidden"}`}'

t = re.sub(target, replacement, t)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
