import glob, re, os, json
from html import unescape

# Load keyword mapping
with open('keyword_mapping.json', 'r') as f:
    keyword_map = json.load(f)

BRAND = "Lobo Prints"
SITE = "https://loboprints.in"

head_close_re = re.compile(r'</head>', re.I)
title_re = re.compile(r'<title>(.*?)</title>', re.I|re.S)
desc_re = re.compile(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\'][^>]*>+', re.I|re.S)

def get_category_from_filename(filename):
    """Extract category from filename."""
    fn_lower = filename.lower()
    # Priority: exact match first (without digits), then partial match
    # Check exact matches first (e.g., "tshirts.html" -> "tshirt")
    for category in keyword_map:
        if fn_lower == category + '.html' or fn_lower == category + 's.html':
            return category
    # Then check partial matches (e.g., "tshirt1.html" -> "tshirt")
    for category in keyword_map:
        if category in fn_lower:
            return category
    return None

def get_category_keywords(filename):
    """Get keywords and descriptions for a page category."""
    category = get_category_from_filename(filename)
    if category and category in keyword_map:
        return keyword_map[category]
    return None

pages = sorted(glob.glob('*.html'))
for p in pages:
    with open(p, 'r', encoding='utf-8', errors='ignore') as fh:
        raw = fh.read()
    orig = raw
    
    # Backup
    bak = p + '.bak'
    if not os.path.exists(bak):
        open(bak, 'w', encoding='utf-8').write(orig)
    
    # Get category keywords
    kw_data = get_category_keywords(p)
    if not kw_data:
        kw_data = keyword_map.get('default')
        if not kw_data:
            print(f'No category and no default mapping: {p}')
            continue
    
    # Extract current title and description
    title_m = title_re.search(raw)
    desc_m = desc_re.search(raw)
    keywords_m = re.search(r'<meta[^>]+name=["\']keywords["\'][^>]*>', raw, re.I)
    
    current_title = unescape(title_m.group(1).strip()) if title_m else ''
    current_desc = unescape(desc_m.group(1).strip()) if desc_m else ''

    # Fix any malformed description tags before other replacements
    raw = re.sub(r'(<meta[^>]+name=["\']description["\'][^>]+content=["\'].*?["\'])(\s*>)+', r'\1>', raw, flags=re.I|re.S)
    
    # Decide on new title and description
    # Category pages vs product pages
    p_lower = p.lower()
    category_collection_pages = {
        'index', 'badges', 'tshirts', 'hoodies', 'jerseys', 'caps', 'ids', 'shorts',
        'trackpants', 'jackets', 'mugs', 'all-products', 'categories', 'sports',
        'why-us', 'services', 'contact', 'track-order'
    }
    if any(p_lower == f'{cat}.html' for cat in category_collection_pages):
        # Category collection and generic pages use the mapping title/description
        new_title = kw_data['category_title']
        new_desc = kw_data['category_desc']
    else:
        # Individual product page - use product-specific title with local search suffix
        if current_title:
            parts = current_title.split('|')
            product_name = parts[0].strip() if parts else current_title
            new_title = product_name.strip() + ' | ' + kw_data['title_suffix']
        else:
            new_title = kw_data.get('category_title', 'Custom Product | ' + kw_data['title_suffix'])

        # Use the category description as the main SEO description for product pages
        product_name = product_name if 'product_name' in locals() else kw_data.get('category_title', '')
        new_desc = f'{product_name}. {kw_data["category_desc"]}'
        if len(new_desc) > 160:
            new_desc = new_desc[:160].rstrip()
            last_space = new_desc.rfind(' ')
            if last_space > 0:
                new_desc = new_desc[:last_space]
        new_desc = new_desc.rstrip(' ,')
        if not new_desc.endswith('.'):
            new_desc += '.'
    
    # Add missing title and description tags if they are absent
    if not title_m and new_title and '</head>' in raw:
        raw = raw.replace('</head>', f'  <title>{new_title}</title>\n</head>', 1)
        title_m = title_re.search(raw)
    if not desc_m and new_desc and '</head>' in raw:
        safe_desc = new_desc.replace('"', '&quot;')
        raw = raw.replace('</head>', f'  <meta name="description" content="{safe_desc}">\n</head>', 1)
        desc_m = desc_re.search(raw)
    if not keywords_m and kw_data and kw_data.get('keywords') and '</head>' in raw:
        kw_text = ', '.join(kw_data.get('keywords', []))
        raw = raw.replace('</head>', f'  <meta name="keywords" content="{kw_text}">\n</head>', 1)
    
    # Apply changes only if different
    if current_title != new_title and title_m:
        raw = raw.replace(title_m.group(0), f'<title>{new_title}</title>')
    
    if current_desc != new_desc and desc_m:
        # Escape quotes in description
        safe_desc = new_desc.replace('"', '&quot;')
        raw = raw.replace(desc_m.group(0), f'<meta name="description" content="{safe_desc}">')
    
    # Write if changed
    if raw != orig:
        with open(p, 'w', encoding='utf-8') as fh:
            fh.write(raw)
        print(f'Improved: {p}')
    else:
        print(f'No change: {p}')

print('Done')
