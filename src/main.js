const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ElectronFileRepository = require('./infrastructure/repositories/ElectronFileRepository');
const SelectFileUseCase = require('./application/useCases/SelectFileUseCase');
const ConvertToPdfUseCase = require('./application/useCases/ConvertToPdfUseCase');
const ExcelToPdfConverter = require('./infrastructure/services/ExcelToPdfConverter');

class MainProcess {
    constructor() {
        this.window = null;
        this.fileRepository = new ElectronFileRepository();
        this.pdfConverter = new ExcelToPdfConverter();
        this.selectFileUseCase = new SelectFileUseCase(this.fileRepository);
        this.convertToPdfUseCase = new ConvertToPdfUseCase(this.pdfConverter, this.fileRepository);
    }

    createWindow() {
        this.window = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
                webviewTag: true
            }
        });

        this.window.loadFile(path.join(__dirname, 'presentation/index.html'));

        // Content-Security-Policy 헤더 설정
        this.window.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        "default-src 'self' https://*.google.com https://*.doubleclick.net;",
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.doubleclick.net;",
                        "style-src 'self' 'unsafe-inline';",
                        "img-src 'self' data: https: http:;",
                        "connect-src 'self' https://*.google.com https://*.doubleclick.net;"
                    ].join(' ')
                }
            });
        });
    }

    setupIpcHandlers() {
        ipcMain.handle('select-files', async () => {
            try {
                const files = await this.selectFileUseCase.execute();
                return files.map(file => ({
                    path: file.path,
                    name: file.name,
                    extension: file.extension,
                    createdAt: file.createdAt
                }));
            } catch (error) {
                console.error('Error in select-files handler:', error);
                throw error;
            }
        });

        ipcMain.handle('convert-to-pdf', async (event, files) => {
            try {
                return await this.convertToPdfUseCase.execute(files);
            } catch (error) {
                console.error('Error in convert-to-pdf handler:', error);
                throw error;
            }
        });
    }

    init() {
        app.whenReady().then(() => {
            // IPC 핸들러를 먼저 등록
            this.setupIpcHandlers();
            
            // 그 다음 윈도우 생성
            this.createWindow();

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }
}

const mainProcess = new MainProcess();
mainProcess.init(); 