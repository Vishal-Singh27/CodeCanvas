import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

t = re.sub(r'className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text', r'className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text pb-2 leading-tight', t)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)


with open('frontend/client/src/components/HomePage.jsx', 'r') as f:
    t = f.read()

t = re.sub(r'className="text-transparent bg-clip-text bg-gradient-to-r', r'className="text-transparent bg-clip-text bg-gradient-to-r pb-2 leading-tight', t)

with open('frontend/client/src/components/HomePage.jsx', 'w') as f:
    f.write(t)
