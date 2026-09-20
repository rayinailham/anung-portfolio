"""Guard for IMG-2 deliverables only; no unrelated repository cleanup."""
import hashlib
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[3]
evidence = root / 'docs/evidence/kirim-img-2'
files = sorted(p for p in evidence.iterdir() if p.is_file() and p.name != 'audit.txt')
files += [root / p for p in ['assets/source/og-cover.png', 'public/images/og-cover.png', 'docs/asset-provenance.md', 'docs/image-jobs/IMG-2-og-image.md']]


def inspect(name, data):
    issues = []
    if Path(name).name.startswith('.env'):
        issues.append('env file')
    if len(data) > 10_000_000:
        issues.append('oversize')
    if 'node_modules' in Path(name).parts:
        issues.append('vendored dependency')
    if Path(name).suffix not in {'.png', '.webp'}:
        text = data.decode('utf-8', errors='replace')
        if re.search(r'(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)', text):
            issues.append('credential')
        if re.search(r'/(?:home|Users)/[a-z][^/\s]*/', text):
            issues.append('absolute home path')
    return issues


# Negative tests use synthetic bytes; no fake credential ever written to disk.
baits = [('.env', b'x'), ('x.bin', b'x' * 10_000_001), ('node_modules/x.js', b'x'),
         ('x.txt', ('ghp_' + 'a' * 36).encode()), ('x.txt', ('/' + 'home' + '/test/private/').encode())]
assert all(inspect(name, data) for name, data in baits), 'Audit failed negative test'
issues = [(str(p.relative_to(root)), issue) for p in files for issue in inspect(str(p.relative_to(root)), p.read_bytes())]
assert len(files) > 0
print(f'{len(files)} files scanned, {len(issues)} findings; {len(baits)} negative cases rejected')
for issue in issues:
    print(issue)
assert not issues
metrics = json.loads((evidence / 'metrics.json').read_text())
delivery = json.loads((evidence / 'delivery.json').read_text())
source = (root / 'assets/source/og-cover.png').read_bytes()
public = (root / 'public/images/og-cover.png').read_bytes()
assert source == public
assert hashlib.sha256(public).hexdigest() == metrics['image']['sha256'] == delivery['delivery']['sha256']
assert len(public) == metrics['image']['bytes'] == delivery['delivery']['bytes']
assert metrics['portraitPixelExact'] and metrics['fontLoaded']
assert all(c['ratio'] >= 4.5 for c in metrics['contrasts'])
assert delivery['delivery']['status'] == 200 and delivery['cleanReproduction']['imageByteIdentical']
assert hashlib.sha256((root / 'anung_profile.jpeg').read_bytes()).hexdigest() == metrics['sourcePhotoSha256']
print('PNG copies, hashes, size, portrait pixels, font, contrast, HTTP delivery and clean reproduction: matched')
readme = (evidence / 'README.md').read_text()
def check_claims(document):
    assert f"{metrics['image']['bytes']} byte" in document
    assert f"{min(c['ratio'] for c in metrics['contrasts']):.3f}:1" in document

check_claims(readme)
try:
    check_claims(readme.replace(f"{metrics['image']['bytes']} byte", '1 byte'))
except AssertionError:
    pass
else:
    raise AssertionError('Number guard failed negative test')
links = re.findall(r'\[[^\]]*\]\(([^)]+)\)', readme)
for link in links:
    assert (evidence / link.split('#')[0]).exists(), f'Missing evidence: {link}'
print(f'README size + minimum contrast: matched; negative number case rejected; {len(links)} evidence links exist')
