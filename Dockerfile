# Python 3.11の公式イメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムの依存関係をインストール（最小限）
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libatlas-base-dev \
    gfortran \
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
