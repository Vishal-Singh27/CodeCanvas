import re
with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

replacements = {
    r'\bbg-black/40\b': 'bg-white/40 dark:bg-black/40',
    r'\bbg-black/50\b': 'bg-white/50 dark:bg-black/50',
    r'\bbg-black/60\b': 'bg-white/60 dark:bg-black/60',
    r'\bbg-black/80\b': 'bg-white/80 dark:bg-black/80',
    r'\bbg-black/90\b': 'bg-white/90 dark:bg-black/90',
}

for pattern, repl in replacements.items():
    t = re.sub(pattern, repl, t)

# Also fix double injections if any
t = re.sub(r'bg-white/40 dark:bg-white/40 dark:bg-black/40', 'bg-white/40 dark:bg-black/40', t)
# etc.. just in case

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
