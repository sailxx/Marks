"""Create the unpacked-extension ZIP using an explicit file allowlist."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
files = ['manifest.json', 'popup.html', 'popup.css', 'popup.js']
files += [str(path.relative_to(root)).replace('\\', '/') for path in (root / 'icons').glob('*.png')]
output = root / 'dist' / f'Marks-{manifest["version"]}.zip'
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, name)
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == set(files)
print(f'{output.name}: OK ({len(files)} files)')
