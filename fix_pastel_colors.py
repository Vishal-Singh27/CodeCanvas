import re
with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

replacements = {
    # Pastel text colors
    r'\btext-purple-400\b': 'text-purple-700 dark:text-purple-400',
    r'\btext-purple-300\b': 'text-purple-800 dark:text-purple-300',
    r'\btext-blue-400\b': 'text-blue-700 dark:text-blue-400',
    r'\btext-blue-300\b': 'text-blue-800 dark:text-blue-300',
    r'\btext-green-400\b': 'text-green-700 dark:text-green-400',
    r'\btext-green-300\b': 'text-green-800 dark:text-green-300',
    r'\btext-emerald-400\b': 'text-emerald-700 dark:text-emerald-400',
    r'\btext-emerald-300\b': 'text-emerald-800 dark:text-emerald-300',
    r'\btext-teal-400\b': 'text-teal-700 dark:text-teal-400',
    r'\btext-teal-300\b': 'text-teal-800 dark:text-teal-300',
    r'\btext-gray-400\b': 'text-gray-600 dark:text-gray-400',
    r'\btext-gray-500\b': 'text-gray-600 dark:text-gray-500',
    
    # Text gradients
    r'from-purple-400': 'from-purple-700 dark:from-purple-400',
    r'to-purple-500': 'to-purple-800 dark:to-purple-500',
    r'from-blue-400': 'from-blue-700 dark:from-blue-400',
    r'to-blue-500': 'to-blue-800 dark:to-blue-500',
}

for pattern, repl in replacements.items():
    t = re.sub(pattern, repl, t)

# Fix double injections
t = re.sub(r'text-gray-600 dark:text-gray-600 dark:text-gray-400', 'text-gray-600 dark:text-gray-400', t)
t = re.sub(r'text-gray-600 dark:text-gray-600 dark:text-gray-500', 'text-gray-600 dark:text-gray-500', t)
t = re.sub(r'text-\w+-700 dark:text-\w+-700 dark:text-(\w+-\d+)', r'text-\1', t) # Just in case

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
