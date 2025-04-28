const File = require('../../domain/entities/File');

class SelectFileUseCase {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
    }

    async execute() {
        const filePaths = await this.fileRepository.selectFile();
        if (!filePaths || filePaths.length === 0) {
            return [];
        }

        const files = filePaths.map(filePath => {
            const file = new File(filePath);
            if (!file.isValid()) {
                throw new Error(`Invalid file type: ${file.name}. Please select Excel files only.`);
            }
            return file;
        });

        return files;
    }
}

module.exports = SelectFileUseCase; 