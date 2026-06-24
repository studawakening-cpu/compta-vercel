#!/usr/bin/env python3
"""Check index.html for common JS errors before pushing"""
import re, sys

with open('index.html') as f:
    content = f.read()

errors = []

# Extract main JS block
s = content.rfind('<script>') + len('<script>')
e = content.rfind('</script>')
js = content[s:e]

# Check for return outside function (rough check - lines starting with return not inside a function body)
lines = js.split('\n')
depth = 0
for i, line in enumerate(lines, 1):
    stripped = line.strip()
    depth += stripped.count('{') - stripped.count('}')
    if stripped.startswith('return ') and depth <= 0:
        errors.append(f"Line {i}: return outside function: {stripped[:60]}")

# Check script tag balance
opens = content.count('<script>')
closes = content.count('</script>')
if opens != closes:
    errors.append(f"Script tags: {opens} open, {closes} close")

# Check for duplicate let declarations at top level
decls = re.findall(r'^let (\w+)', js, re.MULTILINE)
from collections import Counter
for k, v in Counter(decls).items():
    if v > 1:
        errors.append(f"Duplicate let: {k} ({v}x)")

if errors:
    print("ERRORS FOUND:")
    for e in errors:
        print(f"  ❌ {e}")
    sys.exit(1)
else:
    print("✅ No JS errors detected")
