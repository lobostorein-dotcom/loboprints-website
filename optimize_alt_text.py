import glob, re, os
from html import unescape

BRAND = "Lobo Prints"

title_re = re.compile(r'<title>(.*?)</title>', re.I|re.S)
img_re = re.compile(r'<img\s+([^>]*?)>', re.I)
src_re = re.compile(r'src=["\']([^"\']+)["\']', re.I)
alt_re = re.compile(r'alt=["\']([^"\']*)["\']', re.I)

def extract_alt_text(img_tag):
    """Extract alt text from img tag."""
    m = alt_re.search(img_tag)
    if m:
        return m.group(1)
    return None

def get_meaningful_alt(src, page_title):
    """Generate meaningful alt text from src and page title."""
    # Extract filename without extension
    filename = os.path.splitext(os.path.basename(src))[0]
    
    # Clean up filename
    filename = filename.replace('-', ' ').replace('_', ' ').strip()
    filename = ' '.join(word.capitalize() for word in filename.split())
    
    # If page has a title, use it; otherwise use filename
    if page_title and page_title.strip():
        # Extract main product/category from title (before |)
        main_title = page_title.split('|')[0].strip()
        return main_title
    else:
        return filename if filename else 'Product image'

def fix_img_tag(img_tag, page_title):
    """Fix or improve alt text in an img tag."""
    alt = extract_alt_text(img_tag)
    
    # If alt is present and non-empty, keep it
    if alt and alt.strip():
        return img_tag
    
    # Get source to generate meaningful alt
    src_match = src_re.search(img_tag)
    if not src_match:
        return img_tag
    
    src = src_match.group(1)
    new_alt = get_meaningful_alt(src, page_title)
    
    # Replace or add alt attribute
    if alt_re.search(img_tag):
        # Replace empty alt
        return alt_re.sub(f'alt="{new_alt}"', img_tag)
    else:
        # Add alt before closing >
        return img_tag.rstrip('>') + f' alt="{new_alt}">'

pages = sorted(glob.glob('*.html'))
total_fixed = 0
total_images = 0

for p in pages:
    with open(p, 'r', encoding='utf-8', errors='ignore') as fh:
        raw = fh.read()
    orig = raw
    
    # Backup
    bak = p + '.bak'
    if not os.path.exists(bak):
        open(bak, 'w', encoding='utf-8').write(orig)
    
    # Get page title
    title_m = title_re.search(raw)
    page_title = unescape(title_m.group(1).strip()) if title_m else ''
    
    # Find and fix all img tags
    def replace_img(match):
        return fix_img_tag(match.group(0), page_title)
    
    new_raw = img_re.sub(replace_img, raw)
    
    # Count changes
    old_count = len(img_re.findall(raw))
    new_count = len(img_re.findall(new_raw))
    
    # Write if changed
    if new_raw != orig:
        with open(p, 'w', encoding='utf-8') as fh:
            fh.write(new_raw)
        print(f'Fixed alts: {p}')
    else:
        print(f'No change: {p}')

print('Done')
