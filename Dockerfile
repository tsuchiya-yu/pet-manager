FROM node:20-slim

WORKDIR /app

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコピー
COPY . .

# 開発サーバーのポート
EXPOSE 3000

# 開発サーバーの起動
CMD ["npm", "run", "dev"]