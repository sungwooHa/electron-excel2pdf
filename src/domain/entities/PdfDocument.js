const path = require('path');

class PdfDocument {
    constructor(sourcePath, saveDirectory) {
        this.sourcePath = sourcePath;
        this.fileName = path.basename(sourcePath).replace(/\.xlsx?$/, '.pdf');
        this.targetPath = saveDirectory ? path.join(saveDirectory, this.fileName) : this.generateTargetPath(sourcePath);
        this.createdAt = new Date();
    }

    generateTargetPath(sourcePath) {
        return sourcePath.replace(/\.xlsx?$/, '.pdf');
    }
}

module.exports = PdfDocument; 