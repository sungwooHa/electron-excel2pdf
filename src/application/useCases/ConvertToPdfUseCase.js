const PdfDocument = require('../../domain/entities/PdfDocument');

class ConvertToPdfUseCase {
    constructor(pdfConverter, fileRepository) {
        this.pdfConverter = pdfConverter;
        this.fileRepository = fileRepository;
    }

    async execute(files) {
        const results = [];
        const errors = [];

        try {
            const saveDirectory = await this.fileRepository.selectSaveDirectory();
            if (!saveDirectory) {
                throw new Error('Save directory not selected');
            }

            for (const file of files) {
                try {
                    const pdfDoc = new PdfDocument(file.path, saveDirectory);
                    await this.pdfConverter.convert(file.path, pdfDoc.targetPath);
                    results.push({
                        sourcePath: file.path,
                        targetPath: pdfDoc.targetPath,
                        fileName: pdfDoc.fileName,
                        success: true
                    });
                } catch (error) {
                    errors.push({
                        file: file.name,
                        error: error.message
                    });
                }
            }
        } catch (error) {
            throw new Error(`Failed to convert files: ${error.message}`);
        }

        return {
            results,
            errors,
            totalProcessed: files.length,
            successCount: results.length,
            errorCount: errors.length
        };
    }
}

module.exports = ConvertToPdfUseCase; 