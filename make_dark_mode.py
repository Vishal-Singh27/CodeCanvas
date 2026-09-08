import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

replacements = {
    r'\btext-white\b': 'text-gray-900 dark:text-white',
    r'\btext-gray-200\b': 'text-gray-800 dark:text-gray-200',
    r'\btext-gray-300\b': 'text-gray-700 dark:text-gray-300',
    r'\btext-gray-400\b': 'text-gray-500 dark:text-gray-400',
    r'\bbg-white/5\b': 'bg-black/5 dark:bg-white/5',
    r'\bbg-white/10\b': 'bg-black/10 dark:bg-white/10',
    r'\bbg-white/20\b': 'bg-black/10 dark:bg-white/20',
    r'\bborder-white/5\b': 'border-black/10 dark:border-white/5',
    r'\bborder-white/10\b': 'border-black/10 dark:border-white/10',
    r'\bborder-white/20\b': 'border-black/20 dark:border-white/20',
    r'\bbg-dark-900/80\b': 'bg-white/80 dark:bg-[#050505]/80',
    r'\bbg-dark-900\b': 'bg-white dark:bg-[#050505]',
    r'\bborder-dark-800\b': 'border-gray-200 dark:border-white/10',
    r'\bbg-dark-800\b': 'bg-gray-50 dark:bg-white/5',
    r'\bbg-white/\[0\.02\]': 'bg-black/[0.03] dark:bg-white/[0.02]',
    r'\bbg-white/\[0\.03\]': 'bg-black/[0.04] dark:bg-white/[0.03]',
    r'\bbg-white/\[0\.04\]': 'bg-black/[0.05] dark:bg-white/[0.04]',
    r'\bbg-white/\[0\.08\]': 'bg-black/[0.08] dark:bg-white/[0.08]',
    
    # We also need to change the isLightMode useEffect logic!
    r'document\.documentElement\.classList\.add\("light-mode"\);': 'document.documentElement.classList.add("light-mode"); document.documentElement.classList.remove("dark");',
    r'document\.documentElement\.classList\.remove\("light-mode"\);': 'document.documentElement.classList.remove("light-mode"); document.documentElement.classList.add("dark");',
}

for pattern, repl in replacements.items():
    # We want to replace only inside className="..." or className={`...`}
    # A simple but risky way is to just do a global replace, but since these are very specific tailwind classes, it's usually safe.
    t = re.sub(pattern, repl, t)

# Fix double injections just in case we ran this logic before or it stacked
t = re.sub(r'text-gray-900 dark:text-gray-900 dark:text-white', 'text-gray-900 dark:text-white', t)
t = re.sub(r'text-gray-800 dark:text-gray-800 dark:text-gray-200', 'text-gray-800 dark:text-gray-200', t)
t = re.sub(r'text-gray-500 dark:text-gray-500 dark:text-gray-400', 'text-gray-500 dark:text-gray-400', t)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
