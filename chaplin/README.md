# バックエンド

## 概要

本プロジェクトのバックエンドは、[Chaplin](https://github.com/amanvirparhar/chaplin)を利用し、
FastAPIエンドポイントとして提供しています。

## セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/amanvirparhar/chaplin.git
cd chaplin
```
2. モデルをダウンロードして配置する。
[LRS3_V_WER19.1](https://drive.google.com/file/d/1t8RHhzDTTvOQkLQhmK1LZGnXRRXOXGi6/view)をダウンロードして解凍し`chaplin/benchmarks/LRS3/models`に配置、
[lm_en_subword](https://drive.google.com/file/d/1g31HGxJnnOwYl17b70ObFQZ1TSnPvRQv/view)をダウンロードして解凍し`chaplin/benchmarks/LRS3/language_models`に配置
3. 必要なライブラリのダウンロード
```bash
pip install -r chaplin/requirements.txt
```

## 使い方

1. バックエンドの起動
```bash
python app.py
```
2. API利用の例
```bash
curl -X POST http://localhost:8000/infer-video -F "file=@./test_video.mp4"
```