import glob, re

files = sorted(glob.glob('*.html'))
print('file,has_html,has_head,has_head_close,has_body,has_body_close,first_lines_error')
for f in files:
    with open(f, 'r', encoding='utf-8', errors='ignore') as fh:
        raw = fh.read()
    low = raw.lower()
    issues = []
    if '<html' not in low:
        issues.append('missing-html')
    if '<head' not in low:
        issues.append('missing-head')
    if '</head>' not in low:
        issues.append('missing-head-close')
    if '<body' not in low:
        issues.append('missing-body')
    if '</body>' not in low:
        issues.append('missing-body-close')
    if re.search(r'<html[^>]*>\s*</nav>', raw, re.I):
        issues.append('stray-closing-nav')
    if re.search(r'<meta[^>]+name=["\']description["\'][^>]*>>', raw, re.I):
        issues.append('malformed-description')
    if issues:
        first100 = raw[:200].replace('\n','\\n').replace('\r','')
        print(f + ',' + ','.join(issues) + ',' + first100)
