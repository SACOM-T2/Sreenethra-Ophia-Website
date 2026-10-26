"""Build the site's pages from src/.

Each file in src/pages/ starts with a settings comment, then its <main> content:

    <!--
    title: Patient app
    description: One sentence for search engines and link previews.
    nav: app
    scripts: assets/js/videos.js
    -->

The page is dropped into src/layout.html (shared header, footer and loader) and
written to the site root under the same file name. Run from the repository root:

    python tools/build.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
LAYOUT = (ROOT / 'src' / 'layout.html').read_text(encoding='utf-8')
NAV = ['product', 'app', 'why', 'hosting']


def settings(text):
    match = re.match(r'\s*<!--(.*?)-->', text, re.S)
    if not match:
        raise SystemExit('page is missing its settings comment')
    values = {}
    for line in match.group(1).strip().splitlines():
        key, _, value = line.partition(':')
        values[key.strip()] = value.strip()
    return values, text[match.end():].strip()


for page in sorted((ROOT / 'src' / 'pages').glob('*.html')):
    meta, body = settings(page.read_text(encoding='utf-8'))
    scripts = '\n'.join(
        f'<script src="{src.strip()}" defer></script>'
        for src in meta.get('scripts', '').split(',') if src.strip()
    )
    html = LAYOUT
    for key, value in {
        'title': meta['title'],
        'description': meta['description'],
        'content': body,
        'scripts': scripts,
    }.items():
        html = html.replace('{{' + key + '}}', value)
    for name in NAV:
        current = ' aria-current="page"' if meta.get('nav') == name else ''
        html = html.replace('{{current_' + name + '}}', current)
    (ROOT / page.name).write_text(html, encoding='utf-8')
    print('built', page.name)
