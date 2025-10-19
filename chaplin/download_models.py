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

        # 方法1: gdownライブラリを使用
        try:
            url = f"https://drive.google.com/uc?id={file_id}"
            print(f"gdownで試行中: {url}")
            gdown.download(url, destination, quiet=False)
            if os.path.exists(destination) and os.path.getsize(destination) > 0:
                print(f"gdownでダウンロード完了: {destination}")
                return True
        except Exception as e:
            print(f"gdownでのダウンロード失敗: {e}")

        # 方法2: requestsライブラリを使用
        try:
            url = f"https://drive.google.com/uc?export=download&id={file_id}"
            print(f"requestsで試行中: {url}")

            session = requests.Session()
            response = session.get(url, stream=True)

            # 大きなファイルの場合の確認ページをスキップ
            if 'download_warning' in response.url:
                confirm_url = f"https://drive.google.com/uc?export=download&confirm=t&id={file_id}"
                response = session.get(confirm_url, stream=True)

            response.raise_for_status()

            with open(destination, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            if os.path.exists(destination) and os.path.getsize(destination) > 0:
                print(f"requestsでダウンロード完了: {destination}")
                return True

        except Exception as e:
            print(f"requestsでのダウンロード失敗: {e}")

        print("すべてのダウンロード方法が失敗しました")
        return False

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

    # Google DriveのファイルID（実際のファイルID）
    model_file_id = "1p8CWMA1JghP8m57xeZdunPQZLu2aEgt_"  # LRS3_V_WER19.1
    lm_file_id = "1XC-mIHiCwypsE5W4XIwnrAIq71Cr6JmA"     # lm_en_subword

    # モデルが既に存在するかチェック
    model_exists = (models_dir / "LRS3_V_WER19.1").exists()
    lm_exists = (lm_dir / "lm_en_subword").exists()

    if not model_exists:
        print("LRS3_V_WER19.1モデルをダウンロード中...")
        model_zip = "LRS3_V_WER19.1.zip"
        if download_file_from_gdrive(model_file_id, model_zip):
            if extract_zip(model_zip, models_dir):
                os.remove(model_zip)  # ZIPファイルを削除
                print("LRS3_V_WER19.1モデルのセットアップが完了しました")
            else:
                print("モデルの展開に失敗しました")
        else:
            print("LRS3_V_WER19.1モデルのダウンロードに失敗しました")
            print("モデルなしでアプリケーションを起動します")

    if not lm_exists:
        print("lm_en_subwordモデルをダウンロード中...")
        lm_zip = "lm_en_subword.zip"
        if download_file_from_gdrive(lm_file_id, lm_zip):
            if extract_zip(lm_zip, lm_dir):
                os.remove(lm_zip)  # ZIPファイルを削除
                print("lm_en_subwordモデルのセットアップが完了しました")
            else:
                print("言語モデルの展開に失敗しました")
        else:
            print("lm_en_subwordモデルのダウンロードに失敗しました")
            print("言語モデルなしでアプリケーションを起動します")

    if model_exists and lm_exists:
        print("すべてのモデルが準備完了しています！")

if __name__ == "__main__":
    setup_models()
