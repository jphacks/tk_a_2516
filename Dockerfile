# Python 3.11の公式イメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Pythonの依存関係をコピーしてインストール
COPY chaplin/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのコードをコピー
COPY chaplin/ .

# モデルダウンロードスクリプトを実行
RUN python download_models.py

# ポート8080を公開（Cloud Runのデフォルト）
EXPOSE 8080

# 環境変数を設定
ENV PORT=8080
ENV PYTHONPATH=/app

# アプリケーションを起動
CMD ["python", "app.py"]
