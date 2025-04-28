import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

class WebExcelToPdfConverter {
    async convert(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    // PDF 생성
                    const doc = new jsPDF('l', 'mm', 'a4');
                    
                    // 테이블 생성
                    doc.autoTable({
                        head: [jsonData[0]],
                        body: jsonData.slice(1),
                        theme: 'grid',
                        styles: {
                            fontSize: 9,
                            cellPadding: 5,
                            overflow: 'linebreak'
                        },
                        headStyles: {
                            fillColor: [245, 245, 245],
                            textColor: [0, 0, 0],
                            fontStyle: 'bold'
                        }
                    });

                    // PDF 다운로드
                    doc.save('converted.pdf');
                    resolve();
                };

                reader.onerror = (error) => {
                    reject(error);
                };

                reader.readAsArrayBuffer(file);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default WebExcelToPdfConverter; 