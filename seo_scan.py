import glob
import re
from html import unescape

meta_patterns = {
    'title': re.compile(r'<title>(.*?)</title>', re.I | re.S),
    'desc': re.compile(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', re.I | re.S),
    'canonical': re.compile(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\'](.*?)["\']', re.I | re.S),
    'robots': re.compile(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\'](.*?)["\']', re.I | re.S),
    'og:title': re.compile(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\'](.*?)["\']', re.I | re.S),
    'og:desc': re.compile(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\'](.*?)["\']', re.I | re.S),
    'twitter:card': re.compile(r'<meta[^>]+name=["\']twitter:card["\'][^>]+content=["\'](.*?)["\']', re.I | re.S),
    'h1': re.compile(r'<h1[^>]*>(.*?)</h1>', re.I | re.S),
}

img_tag_re = re.compile(r'<img\s+[^>]*>', re.I)
alt_re = re.compile(r'alt=["\'](.*?)["\']', re.I)
jsonld_re = re.compile(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.I | re.S)

header = (
    'file,title_len,desc_len,h1_count,imgs_total,imgs_missing_alt,has_jsonld,has_localbusiness,has_product_schema,'
    'has_og,has_twitter,has_bangalore'
)
print(header)
for f in sorted(glob.glob('*.html')):
    raw = open(f, encoding='utf-8', errors='ignore').read()
    txt = raw.lower()
    row = {'file': f}
    # basic meta
    for k, p in meta_patterns.items():
        m = p.search(raw)
        row[k] = unescape(m.group(1).strip()) if m else ''

    # images and alt coverage
    imgs = img_tag_re.findall(raw)
    imgs_total = len(imgs)
    imgs_missing = 0
    for im in imgs:
        if not alt_re.search(im):
            imgs_missing += 1

    # json-ld checks
    json_blocks = jsonld_re.findall(raw)
    has_jsonld = bool(json_blocks)
    has_local = False
    has_product = False
    for jb in json_blocks:
        jb_low = jb.lower()
        if 'localbusiness' in jb_low or 'postaladdress' in jb_low or 'addresslocality' in jb_low:
            has_local = True
        if '"@type"' in jb_low and 'product' in jb_low:
            has_product = True

    has_og = bool(meta_patterns['og:title'].search(raw) or meta_patterns['og:desc'].search(raw))
    has_twitter = bool(meta_patterns['twitter:card'].search(raw))
    has_bangalore = 'bangalore' in txt

    row['title_len'] = len(row['title'])
    row['desc_len'] = len(row['desc'])
    row['h1_count'] = len(meta_patterns['h1'].findall(raw))

    print(
        f"{row['file']},{row['title_len']},{row['desc_len']},{row['h1_count']},{imgs_total},{imgs_missing},"
        f"{has_jsonld},{has_local},{has_product},{has_og},{has_twitter},{has_bangalore}"
    )
