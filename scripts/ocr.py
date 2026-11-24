import fitz, sys, os, subprocess, concurrent.futures as cf
pdf, outtxt, tess = sys.argv[1], sys.argv[2], sys.argv[3]
tmp = outtxt + '.pages'; os.makedirs(tmp, exist_ok=True)
doc = fitz.open(pdf); n = len(doc)
def page(i):
    png = f'{tmp}/{i:04d}.png'
    doc_i = fitz.open(pdf); doc_i[i].get_pixmap(dpi=200).save(png)
    r = subprocess.run(['tesseract', '--tessdata-dir', tess, png, 'stdout', '-l', 'spa', '--psm', '3'], capture_output=True, text=True)
    os.remove(png); return i, r.stdout
with cf.ThreadPoolExecutor(6) as ex: res = dict(ex.map(page, range(n)))
open(outtxt, 'w').write('[OCR]' + ''.join(f'\n--- página {i+1} ---\n{res[i]}' for i in range(n)))
os.rmdir(tmp); print(os.path.basename(pdf), n, 'pages', len(' '.join(res.values()).split()), 'words', flush=True)
