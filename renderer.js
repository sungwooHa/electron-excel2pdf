const { ipcRenderer } = require('electron');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const fs = require('fs');

let selectedFile = null;

document.getElementById('select-file').addEventListener('click', async () => {
    const filePaths = await ipcRenderer.invoke('select-file');
    if (filePaths && filePaths.length > 0) {
        selectedFile = filePaths[0];
        document.getElementById('file-name').textContent = selectedFile.split('\\').pop();
        document.getElementById('convert').disabled = false;
    }
});

document.getElementById('convert').addEventListener('click', async () => {
    if (!selectedFile) return;

    const progress = document.querySelector('.progress');
    progress.style.display = 'block';

    try {
        // Read Excel file
        const workbook = XLSX.readFile(selectedFile);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Create PDF
        const pdfPath = selectedFile.replace(/\.xlsx?$/, '.pdf');
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // Convert worksheet to array of arrays
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Write data to PDF
        let y = 50;
        data.forEach((row, rowIndex) => {
            let x = 50;
            row.forEach((cell, colIndex) => {
                doc.text(String(cell), x, y);
                x += 100;
            });
            y += 30;
        });

        doc.end();

        writeStream.on('finish', () => {
            alert('PDF has been created successfully!');
            progress.style.display = 'none';
        });
    } catch (error) {
        alert('Error converting file: ' + error.message);
        progress.style.display = 'none';
    }
}); 