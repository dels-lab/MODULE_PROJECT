async function exportCanvasToPDF() {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    const scale = DPI_PRINT / DPI_SCREEN; // ≈ 6.25

    function exportHighRes(canvas) {
        return canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: scale
        });
    }

    const rectoDataUrl = exportHighRes(canvasRecto);
    const versoDataUrl = exportHighRes(canvasVerso);

    // **Utiliser await** car embedPng est asynchrone
    const rectoImage = await pdfDoc.embedPng(rectoDataUrl);
    const versoImage = await pdfDoc.embedPng(versoDataUrl);

    const rectoPage = pdfDoc.addPage([WIDTH_PDF_PT, HEIGHT_PDF_PT]);
    const versoPage = pdfDoc.addPage([WIDTH_PDF_PT, HEIGHT_PDF_PT]);

    rectoPage.drawImage(rectoImage, {
        x: 0,
        y: 0,
        width: WIDTH_PDF_PT,
        height: HEIGHT_PDF_PT
    });

    versoPage.drawImage(versoImage, {
        x: 0,
        y: 0,
        width: WIDTH_PDF_PT,
        height: HEIGHT_PDF_PT
    });

    // **await aussi pour save()**
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CANVAS.pdf';
    link.click();
}
