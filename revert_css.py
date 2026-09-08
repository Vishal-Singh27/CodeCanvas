import re
with open('frontend/client/src/index.css', 'r') as f:
    css = f.read()

# Remove the explicit proper light mode body style
css = re.sub(r'body\s*\{\s*background-color:\s*\#f8fafc;[\s\S]*?color:\s*\#1e293b;\s*\}\s*html\.dark body\s*\{[\s\S]*?color:\s*\#e5e7eb;\s*\}', '', css)

# Put back original body and light-mode hacks
original_body = """
body {
  background-color: #050505;
  background-image: radial-gradient(circle at 15% 50%, rgba(37,99,235,0.25), transparent 50%), radial-gradient(circle at 85% 30%, rgba(168,85,247,0.25), transparent 50%);
  background-attachment: fixed;
  color: #e5e7eb;
}

html.light-mode {
  filter: invert(1) hue-rotate(180deg);
}
html.light-mode img {
  filter: invert(1) hue-rotate(180deg);
}
html.light-mode img.logo-img {
  filter: none;
}
"""

# Insert after utilities
css = re.sub(r'(@tailwind utilities;)', r'\1\n' + original_body, css)

with open('frontend/client/src/index.css', 'w') as f:
    f.write(css)
