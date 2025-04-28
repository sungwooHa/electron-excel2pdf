FROM node:18

# 필요한 의존성 설치
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libatspi2.0-0 \
    libdrm2 \
    libgbm1 \
    libxcb-dri3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 애플리케이션 파일 복사
COPY package*.json ./
COPY main.js ./
COPY index.html ./
COPY renderer.js ./

# 의존성 설치
RUN npm install

# 실행 명령
CMD ["npm", "start"] 