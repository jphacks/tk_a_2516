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
    gfortran \
    && rm -rf /var/lib/apt/lists/*

# PyTorchを先にインストール（CPU版）
RUN pip install --no-cache-dir torch==2.8.0+cpu torchaudio==2.8.0+cpu torchvision==0.23.0+cpu --index-url https://download.pytorch.org/whl/cpu

# その他のPythonの依存関係をインストール
COPY chaplin/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのコードをコピー
COPY chaplin/ .

# モデルダウンロードスクリプトを実行（詳細ログ付き）
RUN echo "=== モデルダウンロード開始 ===" && \
    python download_models.py && \
    echo "=== モデルダウンロード完了 ===" && \
    ls -la benchmarks/LRS3/models/ && \
    ls -la benchmarks/LRS3/language_models/

# ポート8080を公開（Cloud Runのデフォルト）
EXPOSE 8080

# 環境変数を設定
ENV PORT=8080
ENV PYTHONPATH=/app

# アプリケーションを起動
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
