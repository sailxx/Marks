import sys
from urllib.request import urlopen
with urlopen(sys.argv[1], timeout=10) as response:
    assert response.status == 200
    assert b'tests/fixture.js' in response.read()
print('Preview HTTP: 200 OK')
