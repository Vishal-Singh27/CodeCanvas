import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

replacements = {
    r'\btext-gray-900 dark:text-white\b': 'text-white',
    r'\btext-gray-800 dark:text-gray-200\b': 'text-gray-200',
    r'\btext-gray-700 dark:text-gray-300\b': 'text-gray-300',
    r'\btext-gray-600 dark:text-gray-400\b': 'text-gray-400',
    r'\btext-gray-600 dark:text-gray-500\b': 'text-gray-500',
    r'\bbg-black/5 dark:bg-white/5\b': 'bg-white/5',
    r'\bbg-black/10 dark:bg-white/10\b': 'bg-white/10',
    r'\bbg-black/10 dark:bg-white/20\b': 'bg-white/20',
    r'\bborder-black/10 dark:border-white/5\b': 'border-white/5',
    r'\bborder-black/10 dark:border-white/10\b': 'border-white/10',
    r'\bborder-black/20 dark:border-white/20\b': 'border-white/20',
    r'\bbg-white/80 dark:bg-\[\#050505\]/80\b': 'bg-dark-900/80',
    r'\bbg-white dark:bg-\[\#050505\]\b': 'bg-dark-900',
    r'\bborder-gray-200 dark:border-white/10\b': 'border-dark-800',
    r'\bbg-gray-50 dark:bg-white/5\b': 'bg-dark-800',
    r'\bbg-black/\[0\.03\] dark:bg-white/\[0\.02\]': 'bg-white/[0.02]',
    r'\bbg-black/\[0\.04\] dark:bg-white/\[0\.03\]': 'bg-white/[0.03]',
    r'\bbg-black/\[0\.05\] dark:bg-white/\[0\.04\]': 'bg-white/[0.04]',
    r'\bbg-black/\[0\.08\] dark:bg-white/\[0\.08\]': 'bg-white/[0.08]',
    r'\bhover:bg-black/\[0\.08\] dark:hover:bg-white/\[0\.08\]': 'hover:bg-white/[0.08]',
    
    r'document\.documentElement\.classList\.add\("light-mode"\); document\.documentElement\.classList\.remove\("dark"\);': 'document.documentElement.classList.add("light-mode");',
    r'document\.documentElement\.classList\.remove\("light-mode"\); document\.documentElement\.classList\.add\("dark"\);': 'document.documentElement.classList.remove("light-mode");',
    
    # Revert bg-black/ opacity adjustments
    r'\bbg-white/40 dark:bg-black/40\b': 'bg-black/40',
    r'\bbg-white/50 dark:bg-black/50\b': 'bg-black/50',
    r'\bbg-white/60 dark:bg-black/60\b': 'bg-black/60',
    r'\bbg-white/80 dark:bg-black/80\b': 'bg-black/80',
    r'\bbg-white/90 dark:bg-black/90\b': 'bg-black/90',

    # Revert pastel colors
    r'\btext-purple-700 dark:text-purple-400\b': 'text-purple-400',
    r'\btext-purple-800 dark:text-purple-300\b': 'text-purple-300',
    r'\btext-blue-700 dark:text-blue-400\b': 'text-blue-400',
    r'\btext-blue-800 dark:text-blue-300\b': 'text-blue-300',
    r'\btext-green-700 dark:text-green-400\b': 'text-green-400',
    r'\btext-green-800 dark:text-green-300\b': 'text-green-300',
    r'\btext-emerald-700 dark:text-emerald-400\b': 'text-emerald-400',
    r'\btext-emerald-800 dark:text-emerald-300\b': 'text-emerald-300',
    r'\btext-teal-700 dark:text-teal-400\b': 'text-teal-400',
    r'\btext-teal-800 dark:text-teal-300\b': 'text-teal-300',
    r'\bfrom-purple-700 dark:from-purple-400\b': 'from-purple-400',
    r'\bto-purple-800 dark:to-purple-500\b': 'to-purple-500',
    r'\bfrom-blue-700 dark:from-blue-400\b': 'from-blue-400',
    r'\bto-blue-800 dark:to-blue-500\b': 'to-blue-500',

    # Revert Logos
    r'src=\{isLightMode \? "/logo-light\.jpg" : "/logo\.jpg"\}': 'src="/logo.jpg"',
}

for pattern, repl in replacements.items():
    t = re.sub(pattern, repl, t)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)


with open('frontend/client/src/components/HomePage.jsx', 'r') as f:
    t = f.read()
    
t = re.sub(r'src=\{localStorage\.getItem\("codecanvas_theme"\) === "light" \? "/logo-light\.jpg" : "/logo\.jpg"\}', 'src="/logo.jpg"', t)

with open('frontend/client/src/components/HomePage.jsx', 'w') as f:
    f.write(t)

