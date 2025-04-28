const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ExcelToPdfConverter {
    constructor() {
        // 프리텐다드 폰트 경로 설정
        this.fontPath = path.join(__dirname, '../../../assets/fonts/PretendardVariable.ttf');
        
        // 폰트 파일 존재 여부 확인
        if (!fs.existsSync(this.fontPath)) {
            const fontDir = path.dirname(this.fontPath);
            if (!fs.existsSync(fontDir)) {
                fs.mkdirSync(fontDir, { recursive: true });
            }
            // 기본 폰트로 대체
            this.fontPath = null;
        }
    }

    async convert(sourcePath, targetPath) {
        const workbook = XLSX.readFile(sourcePath, { codepage: 65001 }); // UTF-8 인코딩 사용
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    autoFirstPage: true,
                    size: 'A4',
                    layout: 'landscape', // 가로 방향으로 설정
                    margin: 30,
                    bufferPages: true
                });

                const stream = fs.createWriteStream(targetPath);
                doc.pipe(stream);

                // 기본 폰트 설정
                if (this.fontPath) {
                    doc.registerFont('Pretendard-Regular', this.fontPath);
                    doc.registerFont('Pretendard-Bold', this.fontPath);
                }

                // 테이블 스타일 설정
                const cellPadding = 8;
                const fontSize = 9;
                const minRowHeight = 18;
                let y = 30;

                // 페이지 크기 계산
                const pageWidth = doc.page.width - 60;  // 좌우 여백 각각 30
                const pageHeight = doc.page.height - 60; // 상하 여백 각각 30

                // 열 너비 계산
                const columnWidths = this.calculateColumnWidths(data, doc);
                const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

                // 전체 페이지 수 계산
                const pagesNeeded = Math.ceil(totalWidth / pageWidth);
                let currentPage = 0;
                let startColIndex = 0;

                // 각 페이지 생성
                while (currentPage < pagesNeeded) {
                    if (currentPage > 0) {
                        doc.addPage();
                    }

                    let availableWidth = pageWidth;
                    let endColIndex = startColIndex;
                    let currentWidth = 0;

                    // 현재 페이지에 들어갈 수 있는 열 수 계산
                    while (endColIndex < columnWidths.length && currentWidth + columnWidths[endColIndex] <= availableWidth) {
                        currentWidth += columnWidths[endColIndex];
                        endColIndex++;
                    }

                    // 데이터 렌더링
                    data.forEach((row, rowIndex) => {
                        let x = 30;
                        let maxRowHeight = minRowHeight;

                        // 현재 행의 최대 높이 계산
                        for (let colIndex = startColIndex; colIndex < endColIndex; colIndex++) {
                            if (row[colIndex] !== undefined) {
                                const cellContent = String(row[colIndex] || '');
                                const cellWidth = columnWidths[colIndex];
                                const cellHeight = this.calculateCellHeight(doc, cellContent, cellWidth, fontSize);
                                maxRowHeight = Math.max(maxRowHeight, cellHeight);
                            }
                        }

                        // 페이지 넘김 처리 (세로 방향)
                        if (y + maxRowHeight > doc.page.height - 30) {
                            doc.addPage();
                            y = 30;
                        }

                        // 현재 페이지의 열만 그리기
                        for (let colIndex = startColIndex; colIndex < endColIndex; colIndex++) {
                            if (colIndex >= row.length) continue;

                            const cellWidth = columnWidths[colIndex];
                            const cellContent = row[colIndex] === null || row[colIndex] === undefined ? '' : String(row[colIndex]);

                            // 셀 배경 (헤더)
                            if (rowIndex === 0) {
                                doc.save();
                                doc.rect(x, y, cellWidth, maxRowHeight).fill('#f5f5f5');
                                doc.restore();
                            }

                            // 셀 테두리
                            doc.save();
                            doc.rect(x, y, cellWidth, maxRowHeight).stroke('#000000');
                            doc.restore();

                            // 텍스트 스타일링 및 그리기
                            doc.save();
                            if (rowIndex === 0) {
                                doc.font(this.fontPath ? 'Pretendard-Bold' : 'Helvetica-Bold');
                            } else {
                                doc.font(this.fontPath ? 'Pretendard-Regular' : 'Helvetica');
                            }
                            doc.fontSize(fontSize)
                               .fillColor('#000000')
                               .text(cellContent, x + 2, y + 2, {
                                    width: cellWidth - 4,
                                    height: maxRowHeight - 4,
                                    align: 'left',
                                    lineGap: 1
                                });
                            doc.restore();

                            x += cellWidth;
                        }

                        y += maxRowHeight;
                    });

                    // 다음 페이지 준비
                    startColIndex = endColIndex;
                    currentPage++;
                    y = 30;
                }

                doc.end();

                stream.on('finish', () => {
                    resolve();
                });

                stream.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    calculateCellHeight(doc, text, width, fontSize) {
        const words = String(text).split('');  // 한글은 단어 단위가 아닌 문자 단위로 분리
        let line = '';
        let height = fontSize + 4;

        words.forEach(char => {
            const testLine = line + char;
            const measurement = doc.widthOfString(testLine);
            
            if (measurement > width - 6) {
                height += fontSize + 1;
                line = char;
            } else {
                line = testLine;
            }
        });

        return height;
    }

    calculateColumnWidths(data, doc) {
        const columnWidths = [];
        const minWidth = 40;
        const maxWidth = 300; // 최대 열 너비 설정

        // 각 열의 최대 문자 길이 계산
        data.forEach(row => {
            row.forEach((cell, colIndex) => {
                const cellContent = String(cell || '');
                const contentWidth = doc.widthOfString(cellContent) + 10; // 여백 증가
                columnWidths[colIndex] = Math.max(
                    columnWidths[colIndex] || minWidth,
                    Math.min(contentWidth, maxWidth) // 최대 너비 제한
                );
            });
        });

        return columnWidths;
    }
}

module.exports = ExcelToPdfConverter; 