"""Abre o .docx no LibreOffice, atualiza sumario e listas, e exporta em PDF."""
import subprocess, sys, time, uno
from com.sun.star.beans import PropertyValue
from pathlib import Path

entrada, saida = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
proc = subprocess.Popen(["soffice", "--headless", "--invisible", "--norestore",
                         "--accept=socket,host=localhost,port=2002;urp;"])
ctx = None
local = uno.getComponentContext()
resolver = local.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", local)
for _ in range(60):
    try:
        ctx = resolver.resolve("uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext"); break
    except Exception:
        time.sleep(1)
desktop = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
def pv(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p
doc = desktop.loadComponentFromURL(entrada.as_uri(), "_blank", 0, (pv("Hidden", True),))
for _ in range(2):
    idx = doc.getDocumentIndexes()
    for i in range(idx.getCount()):
        idx.getByIndex(i).update()
    doc.refresh()
print("indices:", doc.getDocumentIndexes().getCount())
doc.storeToURL(saida.as_uri(), (pv("FilterName", "writer_pdf_Export"),))
docx_atual = saida.with_suffix(".atualizado.docx")
doc.storeToURL(docx_atual.as_uri(), (pv("FilterName", "MS Word 2007 XML"),))
doc.close(True)
try:
    desktop.terminate()
except Exception:
    pass
proc.wait(timeout=30)
print("ok", saida)
