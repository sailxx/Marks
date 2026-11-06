"""Check release contents and UI integration contracts without browser dependencies."""
import json
import re
from pathlib import Path
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
assert manifest['permissions'] == ['bookmarks', 'activeTab', 'favicon']
html = (root / 'popup.html').read_text(encoding='utf-8')
js = (root / 'popup.js').read_text(encoding='utf-8')
css = (root / 'popup.css').read_text(encoding='utf-8')
for identifier in re.findall(r"getElementById\('([^']+)'\)", js):
    assert f'id="{identifier}"' in html, identifier
assert '[hidden] { display: none !important; }' in css
assert '--bg: #000;' in css
assert 'prefers-reduced-motion' in css
assert 'form id="add" hidden' in html
with ZipFile(root / 'dist' / f'Marks-{manifest["version"]}.zip') as archive:
    assert archive.testzip() is None
    assert all(name in ['manifest.json', 'popup.html', 'popup.css', 'popup.js'] or name.startswith('icons/') for name in archive.namelist())
    for name in archive.namelist():
        assert archive.read(name) == (root / name).read_bytes(), name
print('Release checks: PASS (permissions, DOM references, hidden form, OLED palette, reduced motion, ZIP integrity)')
