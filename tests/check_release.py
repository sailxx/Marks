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
# Chromium measures extension popups from a narrow initial viewport.
# A viewport-relative cap here prevents the popup from growing to 360px.
for selector in ('html', 'body'):
    block = re.search(r'\b' + selector + r'\s*\{([^}]+)\}', css).group(1)
    assert 'width: 360px;' in block, selector
    assert 'min-width: 360px;' in block, selector
    assert not re.search(r'\b(?:max-)?width\s*:[^;]*\b(?:vw|%)', block), selector
assert '<html lang="en">' in html
assert not re.search(r'[А-Яа-яЁё]', html + manifest['description'])
# Comments may be in any language, but shipped interface strings must be English.
assert not re.search(r'[А-Яа-яЁё]', re.sub(r'//[^\n]*', '', js))
for selector in ('html', 'body'):
    block = re.search(r'\b' + selector + r'\s*\{([^}]+)\}', css).group(1)
    assert 'border-radius: 0;' in block, selector
    assert 'background: var(--bg);' in block, selector
    assert 'overflow: hidden;' in block, selector
assert 'border: 0;' in re.search(r'\bbody\s*\{([^}]+)\}', css).group(1)
assert 'prefers-reduced-motion' in css
assert 'form id="add" hidden' in html
with ZipFile(root / 'dist' / f'Marks-{manifest["version"]}.zip') as archive:
    assert archive.testzip() is None
    assert all(name in ['manifest.json', 'popup.html', 'popup.css', 'popup.js'] or name.startswith('icons/') for name in archive.namelist())
    for name in archive.namelist():
        assert archive.read(name) == (root / name).read_bytes(), name
print('Release checks: PASS (permissions, DOM references, hidden form, OLED palette, reduced motion, ZIP integrity)')
