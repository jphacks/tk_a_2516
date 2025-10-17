#!/usr/bin/env python3
"""
モデルファイルのダウンロードスクリプト
Cloud Runデプロイ時に自動実行される
"""

import os
import requests
import zipfile
from pathlib import Path
import gdown

def download_file_from_gdrive(file_id: str, destination: str) -> bool:
    """Google Driveからファイルをダウンロードする"""
    try:
        print(f"Google Driveからダウンロード中: {file_id}")
        url = f"https://drive.google.com/uc?id={file_id}"
        gdown.download(url, destination, quiet=False)
        print(f"ダウンロード完了: {destination}")
        return True
    except Exception as e:
        print(f"ダウンロードエラー: {e}")
        return False

def extract_zip(zip_path: str, extract_to: str) -> bool:
    """ZIPファイルを展開する"""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"展開完了: {zip_path} -> {extract_to}")
        return True
    except Exception as e:
        print(f"展開エラー: {e}")
        return False

def setup_models():
    """必要なモデルをセットアップする"""
    # モデルディレクトリの作成
    models_dir = Path("benchmarks/LRS3/models")
    lm_dir = Path("benchmarks/LRS3/language_models")

    models_dir.mkdir(parents=True, exist_ok=True)
    lm_dir.mkdir(parents=True, exist_ok=True)

    # Google DriveのファイルID
    model_file_id = "1t8RHhzDTTvOQkLQhmK1LZGnXRRXOXGi6"  # LRS3_V_WER19.1
    lm_file_id = "1g31HGxJnnOwYl17b70ObFQZ1TSnPvRQv"     # lm_en_subword

    # モデルが既に存在するかチェック
    model_exists = (models_dir / "LRS3_V_WER19.1").exists()
    lm_exists = (lm_dir / "lm_en_subword").exists()

    if not model_exists:
        print("LRS3_V_WER19.1モデルをダウンロード中...")
        model_zip = "LRS3_V_WER19.1.zip"
        if download_file_from_gdrive(model_file_id, model_zip):
            extract_zip(model_zip, models_dir)
            os.remove(model_zip)  # ZIPファイルを削除
        else:
            print("モデルのダウンロードに失敗しました")

    if not lm_exists:
        print("lm_en_subwordモデルをダウンロード中...")
        lm_zip = "lm_en_subword.zip"
        if download_file_from_gdrive(lm_file_id, lm_zip):
            extract_zip(lm_zip, lm_dir)
            os.remove(lm_zip)  # ZIPファイルを削除
        else:
            print("言語モデルのダウンロードに失敗しました")

    if model_exists and lm_exists:
        print("すべてのモデルが準備完了しています！")

if __name__ == "__main__":
    setup_models()
