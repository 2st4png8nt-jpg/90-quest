"""Pack the Expo web export (dist/) into one self-contained HTML page for the in-chat preview.
Usage: npx expo export --platform web --output-dir dist && python3 tools/build-preview.py dist ../preview/index.html"""
import base64, glob, mimetypes, os, re, sys
dist, out = sys.argv[1], sys.argv[2]
js_path = glob.glob(os.path.join(dist, '_expo/static/js/web/*.js'))[0]
js = open(js_path, encoding='utf-8').read()
def data_uri(m):
    rel = m.group(1)
    f = os.path.join(dist, rel.lstrip('/'))
    if not os.path.exists(f):
        return m.group(0)
    mime = 'font/ttf' if f.endswith('.ttf') else (mimetypes.guess_type(f)[0] or 'application/octet-stream')
    return '"data:%s;base64,%s"' % (mime, base64.b64encode(open(f, 'rb').read()).decode())
js = re.sub(r'"(/assets/[^"]+)"', data_uri, js)
js = js.replace('</script', '<\\/script')
page = f'''<title>90 Day Quest</title>
<style>
html, body {{ height: 100%; background: #EAF3F8; }}
body {{ overflow: hidden; }}
#root {{ display: flex; height: 100%; flex: 1; }}
</style>
<div id="root"></div>
<script>{js}</script>
'''
open(out, 'w', encoding='utf-8').write(page)
print('wrote', out, round(len(page) / 1024), 'KB; unresolved asset refs:', len(re.findall(r'"/assets/', js)))
