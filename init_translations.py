#!/usr/bin/env python
import os
import subprocess

# Define supported languages
languages = ['en', 'es', 'fr', 'it']

# Create translations directory if it doesn't exist
os.makedirs('translations', exist_ok=True)

# Extract messages from Python and Jinja2 templates
subprocess.run(['pybabel', 'extract', '-F', 'babel.cfg', '-o', 'translations/messages.pot', '.'])

# Initialize or update message catalogs for each language
for lang in languages:
    lang_dir = os.path.join('translations', lang, 'LC_MESSAGES')
    os.makedirs(lang_dir, exist_ok=True)
    
    po_file = os.path.join('translations', lang, 'LC_MESSAGES', 'messages.po')
    
    if os.path.exists(po_file):
        # Update existing translations
        subprocess.run(['pybabel', 'update', '-i', 'translations/messages.pot', '-d', 'translations', '-l', lang])
    else:
        # Initialize new translations
        subprocess.run(['pybabel', 'init', '-i', 'translations/messages.pot', '-d', 'translations', '-l', lang])

# Compile translations
subprocess.run(['pybabel', 'compile', '-d', 'translations'])

print("Translations initialized successfully!")