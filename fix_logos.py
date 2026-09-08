import re
with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

# Fix double classNames
t = re.sub(r'className="invert dark:invert-0 transition-all duration-300"\s+className="', r'className="invert dark:invert-0 transition-all duration-300 ', t)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
