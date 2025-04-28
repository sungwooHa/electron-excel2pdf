# Excel to PDF Converter

Excel 파일을 PDF로 변환하는 데스크톱 애플리케이션입니다.

## 주요 기능

- 여러 Excel 파일을 한 번에 PDF로 변환
- 변환된 PDF 파일의 저장 위치 표시
- 변환 결과 및 오류 메시지 표시

## 시스템 요구사항

- Windows 10 이상
- Node.js 14.0.0 이상
- npm 6.0.0 이상

## 설치 방법

1. 저장소 클론:
```bash
git clone https://github.com/yourusername/excel2pdf.git
cd excel2pdf
```

2. 의존성 설치:
```bash
npm install
```

3. 개발 모드로 실행:
```bash
npm start
```

4. 배포용 빌드:
```bash
npm run dist
```

## 사용 방법

1. "Select Excel Files" 버튼을 클릭하여 변환할 Excel 파일을 선택합니다.
2. 선택한 파일이 목록에 표시됩니다.
3. "Convert to PDF" 버튼을 클릭하여 변환을 시작합니다.
4. 변환이 완료되면 저장 위치와 변환된 파일 목록이 표시됩니다.

## 기술 스택

- Electron
- Node.js
- HTML/CSS/JavaScript

## 프로젝트 구조

```
excel2pdf/
├── src/
│   ├── main.js                 # 메인 프로세스
│   ├── presentation/
│   │   ├── index.html          # 메인 UI
│   │   └── renderer.js         # 렌더러 프로세스
│   ├── infrastructure/
│   │   ├── repositories/       # 파일 저장소
│   │   └── services/          # 변환 서비스
│   └── application/
│       └── useCases/          # 비즈니스 로직
├── package.json
└── README.md
```

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 