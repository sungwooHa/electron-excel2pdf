const { ipcRenderer } = require('electron');
const path = require('path');

class FilePresenter {
    constructor() {
        this.files = new Map();
        this.initializeListeners();
        this.updateConvertButton();
        this.initializeText();
    }

    initializeListeners() {
        document.getElementById('selectFiles').addEventListener('click', () => this.handleFileSelect());
        document.getElementById('convertToPdf').addEventListener('click', () => this.handleConversion());
    }

    async handleFileSelect() {
        try {
            const files = await ipcRenderer.invoke('select-files');
            this.files = new Map(files.map(file => [file.path, file]));
            this.updateFileList();
            this.updateConvertButton();
        } catch (error) {
            console.error('Error selecting files:', error);
            this.showError(error.message);
        }
    }

    async handleConversion() {
        const progress = document.getElementById('progress');
        const convertButton = document.getElementById('convertToPdf');
        
        try {
            progress.style.display = 'block';
            convertButton.disabled = true;
            
            const files = Array.from(this.files.values());
            const result = await ipcRenderer.invoke('convert-to-pdf', files);
            this.showConversionResults(result);
        } catch (error) {
            console.error('Error converting files:', error);
            this.showError(error.message);
        } finally {
            progress.style.display = 'none';
            convertButton.disabled = false;
        }
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        
        this.files.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file.name;
            fileList.appendChild(li);
        });
    }

    updateConvertButton() {
        const convertButton = document.getElementById('convertToPdf');
        convertButton.disabled = this.files.size === 0;
    }

    initializeText() {
        document.getElementById('selectFiles').textContent = 'Select Excel Files';
        document.getElementById('convertToPdf').textContent = 'Convert to PDF';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showConversionResults(result) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        
        const popup = document.createElement('div');
        popup.className = 'popup';
        
        // 변환 결과가 있는 경우
        if (result.results && result.results.length > 0) {
            const saveDir = path.dirname(result.results[0].targetPath);
            const successCount = result.results.length;
            popup.innerHTML = `
                <h3>✅ 변환 완료</h3>
                <p>총 ${successCount}개의 파일이 성공적으로 변환되었습니다.</p>
                <p>저장 위치: ${saveDir}</p>
                <p>변환된 파일 목록:</p>
                <ul>
                    ${result.results.map(r => `<li>${path.basename(r.targetPath)}</li>`).join('')}
                </ul>
            `;
        } 
        // 오류가 있는 경우
        else if (result.errors && result.errors.length > 0) {
            popup.innerHTML = `
                <h3>❌ 변환 실패</h3>
                <p>다음 파일들의 변환에 실패했습니다:</p>
                <ul>
                    ${result.errors.map(e => `<li>${e.file}: ${e.error}</li>`).join('')}
                </ul>
            `;
        }
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // 3초 후에 자동으로 닫힘
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 3000);
    }
}

const presenter = new FilePresenter(); 