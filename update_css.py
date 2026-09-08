import re
with open('frontend/client/src/index.css', 'r') as f:
    css = f.read()

# Remove the light-mode invert hack
css = re.sub(r'html\.light-mode\s*\{[^}]*\}', '', css)
css = re.sub(r'html\.light-mode img\s*\{[^}]*\}', '', css)
css = re.sub(r'html\.light-mode img\.logo-img\s*\{[^}]*\}', '', css)

# Add proper light mode body styles
body_style = """
body {
  background-color: #f8fafc;
  background-image: radial-gradient(circle at 15% 50%, rgba(37,99,235,0.1), transparent 50%), radial-gradient(circle at 85% 30%, rgba(168,85,247,0.1), transparent 50%);
  background-attachment: fixed;
  color: #1e293b;
}

html.dark body {
  background-color: #050505;
  background-image: radial-gradient(circle at 15% 50%, rgba(37,99,235,0.25), transparent 50%), radial-gradient(circle at 85% 30%, rgba(168,85,247,0.25), transparent 50%);
  color: #e5e7eb;
}
"""

css = re.sub(r'body\s*\{[^}]*\}', body_style.strip(), css)

with open('frontend/client/src/index.css', 'w') as f:
    f.write(css)
