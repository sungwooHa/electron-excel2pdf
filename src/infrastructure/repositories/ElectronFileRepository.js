const { dialog } = require('electron');

class ElectronFileRepository {
    async selectFile() {
        const result = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
            ]
        });
        return result.filePaths;
    }

    async selectSaveDirectory() {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory'],
            title: 'Select Directory to Save PDFs'
        });
        return result.filePaths[0];
    }
}

module.exports = ElectronFileRepository; 