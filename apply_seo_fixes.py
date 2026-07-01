import glob, re, os
from html import unescape

LAT = "12.9077"
LON = "77.5850"
LOCALITY = "JP Nagar, Bangalore"
BRAND = "Lobo Prints"
SITE = "https://loboprints.in"

img_re = re.compile(r'<img\s+[^>]*>', re.I)
src_re = re.compile(r'src=["\'](.*?)["\']', re.I)
alt_re = re.compile(r'alt=["\'](.*?)["\']', re.I)
head_open_re = re.compile(r'<head[^>]*>', re.I)
head_close_re = re.compile(r'</head>', re.I)
body_close_re = re.compile(r'</body>', re.I)
html_open_re = re.compile(r'<html[^>]*>', re.I)
title_re = re.compile(r'<title>(.*?)</title>', re.I|re.S)
desc_re = re.compile(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\'][^>]*>+', re.I|re.S)
jsonld_re = re.compile(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>.*?</script>', re.I|re.S)
product_type_re = re.compile(r'"@type"\s*:\s*"Product"', re.I)

pages = sorted(glob.glob('*.html'))
for p in pages:
    with open(p, 'r', encoding='utf-8', errors='ignore') as fh:
        raw = fh.read()
    orig = raw
    # backup
    bak = p + '.bak'
    if not os.path.exists(bak):
        open(bak, 'w', encoding='utf-8').write(orig)

    lower = raw.lower()
    # Clean broken top-level markup where </nav> appears immediately after <html>
    raw = re.sub(r'(<html[^>]*>)(\s*</nav>)', r'\1', raw, count=1, flags=re.I)
    # Repair missing <head> if there is a </head> present but no opening tag
    if '</head>' in raw.lower() and not head_open_re.search(raw):
        raw = html_open_re.sub(lambda m: m.group(0) + '\n<head>', raw, count=1)
    # Ensure body starts after head if necessary
    if '</head>' in raw.lower() and '<body' not in raw.lower():
        raw = raw.replace('</head>', '</head>\n<body>', 1)
    # --- ensure head exists and capture insertion point
    m_head = head_close_re.search(raw)
    head_inserts = []
    if m_head:
        head_idx = m_head.start()
        head_html = raw[:head_idx]
    else:
        head_idx = None
        head_html = ''

    # title & desc
    title_m = title_re.search(raw)
    title = unescape(title_m.group(1).strip()) if title_m else ''
    desc_m = desc_re.search(raw)
    desc = unescape(desc_m.group(1).strip()) if desc_m else ''

    # 1) Standardize title: ensure contains brand and Bangalore
    if title and ('bangalore' not in title.lower() or BRAND.lower() not in title.lower()):
        new_title = title
        if 'bangalore' not in title.lower():
            new_title = new_title + ' | ' + BRAND + ', Bangalore'
        elif BRAND.lower() not in title.lower():
            new_title = new_title + ' | ' + BRAND
        raw = raw.replace(title_m.group(0), f'<title>{new_title}</title>')
        title = new_title

    # 2) Standardize meta description: include brand + locality if missing
    if desc and (BRAND.lower() not in desc.lower() or 'bangalore' not in desc.lower()):
        add = f' {BRAND} in {LOCALITY}.'
        new_desc = (desc + add)[:300]
        if desc_m:
            raw = raw.replace(desc_m.group(0), f'<meta name="description" content="{new_desc}">')
            desc = new_desc
    # Fix any malformed description tags
    raw = re.sub(r'(<meta[^>]+name=["\']description["\'][^>]+content=["\'].*?["\'])(\s*>)+', r'\1>', raw, flags=re.I|re.S)

    # 3) Ensure OG/Twitter tags exist in head
    has_og = re.search(r'<meta[^>]+property=["\']og:title["\']', raw, re.I)
    if not has_og and head_idx is not None:
        og_block = f'  <meta property="og:title" content="{title}">\n  <meta property="og:description" content="{desc}">\n'
        tw_block = f'  <meta name="twitter:card" content="summary">\n  <meta name="twitter:title" content="{title}">\n  <meta name="twitter:description" content="{desc}">\n'
        raw = raw[:head_idx] + og_block + tw_block + raw[head_idx:]

    # 4) Ensure geo meta tags
    if head_idx is not None and 'geo.region' not in lower:
        geo_block = (
            f'  <meta name="geo.region" content="IN-KA">\n'
            f'  <meta name="geo.placename" content="{LOCALITY}, Karnataka">\n'
            f'  <meta name="geo.position" content="{LAT};{LON}">\n'
            f'  <meta name="ICBM" content="{LAT},{LON}">\n'
        )
        raw = raw[:head_idx] + geo_block + raw[head_idx:]

    # 5) Ensure LocalBusiness JSON-LD present (detect existing JSON-LD scripts first)
    json_blocks = jsonld_re.findall(raw)
    has_local_ld = False
    for jb in json_blocks:
        jb_low = jb.lower()
        if 'localbusiness' in jb_low or 'addresslocality' in jb_low or 'postaladdress' in jb_low:
            has_local_ld = True
            break
    if not has_local_ld:
        # craft small LocalBusiness JSON-LD
        lb = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": SITE + "/#localbusiness",
            "name": BRAND,
            "telephone": "+919742118799",
            "email": "business@loboprints.in",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "JP Nagar",
                "addressLocality": LOCALITY,
                "addressRegion": "Karnataka",
                "addressCountry": "IN"
            },
            "geo": {"@type": "GeoCoordinates","latitude": LAT, "longitude": LON},
            "areaServed": "Bangalore, Karnataka, India",
            "url": SITE
        }
        import json
        lb_json = json.dumps(lb, ensure_ascii=False)
        script = f'\n<script type="application/ld+json">{lb_json}</script>\n'
        # insert before </body>
        m_body = body_close_re.search(raw)
        if m_body:
            raw = raw[:m_body.start()] + script + raw[m_body.start():]
        else:
            raw = raw + script

    # 6) Product schema: add minimal Product JSON-LD for product pages missing it
    if not product_type_re.search(raw):
        # heuristics to detect product by in-page markers
        detected = False
        if 'product-main-image' in raw or 'product-image' in raw or re.search(r'class=["\']display-6', raw):
            detected = True
        # additional heuristic: filename patterns for common product pages
        product_patterns = ['tshirt', 'hoodie', 'jersey', 'cap', 'badge', 'id', 'short', 'trackpant', 'jacket', 'mug']
        if not detected:
            lp = p.lower()
            for pp in product_patterns:
                if pp in lp:
                    detected = True
                    break
        if detected:
            # get first image src
            imgs = img_re.findall(raw)
            img_src = ''
            for im in imgs:
                s = src_re.search(im)
                if s:
                    img_src = s.group(1)
                    break
            sku = os.path.splitext(p)[0].upper()
            product = {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": title or sku,
                "description": desc or f'{BRAND} product',
                "sku": sku,
                "image": [img_src] if img_src else [],
                "brand": {"@type": "Brand", "name": BRAND},
                "url": SITE + '/' + p,
                "areaServed": "Bangalore, Karnataka, India",
            }
            # remove None values (brand may be None)
            product = {k: v for k, v in product.items() if v is not None}
            import json
            prod_json = json.dumps(product, ensure_ascii=False)
            script = f'\n<script type="application/ld+json">{prod_json}</script>\n'
            m_body = body_close_re.search(raw)
            if m_body:
                raw = raw[:m_body.start()] + script + raw[m_body.start():]
            else:
                raw = raw + script

    # 7) Image alt fixes: fill empty alt or missing alt
    def fix_img(match):
        tag = match.group(0)
        if 'alt=' in tag.lower():
            # if alt="" replace with generated
            a = alt_re.search(tag)
            if a and a.group(1).strip() == '':
                # use title or filename
                replacement = a.group(0).replace('""', '"' + (title or os.path.basename(src_re.search(tag).group(1))) + '"') if src_re.search(tag) else a.group(0)
                return tag.replace(a.group(0), replacement)
            return tag
        else:
            # add alt with title or filename
            s = src_re.search(tag)
            srcval = s.group(1) if s else ''
            alttext = title or os.path.splitext(os.path.basename(srcval))[0]
            # place alt before closing >
            return tag[:-1] + f' alt="{alttext}">'
    raw = img_re.sub(fix_img, raw)

    # 8) write back if changed
    if raw != orig:
        with open(p, 'w', encoding='utf-8') as fh:
            fh.write(raw)
        print(f'Updated: {p}')
    else:
        print(f'No change: {p}')

print('Done')
