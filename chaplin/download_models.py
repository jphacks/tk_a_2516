#!/usr/bin/env python3
"""
モデルファイルのダウンロードスクリプト
Cloud Runデプロイ時に自動実行される
"""

import os
import sys
import requests
import zipfile
from pathlib import Path
import gdown
import time

def download_file_from_gdrive(file_id: str, destination: str) -> bool:
    """Google Driveからファイルをダウンロードする"""
    print(f"=== ダウンロード開始 ===")
    print(f"ファイルID: {file_id}")
    print(f"保存先: {destination}")
    print(f"現在の作業ディレクトリ: {os.getcwd()}")

    try:
        # 方法1: gdownライブラリを使用
        try:
            url = f"https://drive.google.com/uc?id={file_id}"
            print(f"方法1: gdownで試行中: {url}")
            result = gdown.download(url, destination, quiet=False)
            print(f"gdown結果: {result}")

            if os.path.exists(destination):
                file_size = os.path.getsize(destination)
                print(f"ファイル存在確認: {destination} (サイズ: {file_size} bytes)")
                if file_size > 0:
                    print(f"✅ gdownでダウンロード成功: {destination}")
                    return True
                else:
                    print(f"❌ ファイルサイズが0: {destination}")
            else:
                print(f"❌ ファイルが存在しません: {destination}")

        except Exception as e:
            print(f"❌ gdownでのダウンロード失敗: {e}")
            print(f"エラータイプ: {type(e).__name__}")

        # 方法2: requestsライブラリを使用
        try:
            url = f"https://drive.google.com/uc?export=download&id={file_id}"
            print(f"方法2: requestsで試行中: {url}")

            session = requests.Session()
            response = session.get(url, stream=True)
            print(f"レスポンスステータス: {response.status_code}")
            print(f"レスポンスURL: {response.url}")

            # 大きなファイルの場合の確認ページをスキップ
            if 'download_warning' in response.url:
                confirm_url = f"https://drive.google.com/uc?export=download&confirm=t&id={file_id}"
                print(f"大きなファイルの確認ページをスキップ: {confirm_url}")
                response = session.get(confirm_url, stream=True)
                print(f"確認後レスポンスステータス: {response.status_code}")

            response.raise_for_status()

            total_size = 0
            with open(destination, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        total_size += len(chunk)
                        if total_size % (1024 * 1024) == 0:  # 1MBごとにログ
                            print(f"ダウンロード進行中: {total_size / (1024 * 1024):.1f}MB")

            if os.path.exists(destination):
                file_size = os.path.getsize(destination)
                print(f"ファイル存在確認: {destination} (サイズ: {file_size} bytes)")
                if file_size > 0:
                    print(f"✅ requestsでダウンロード成功: {destination}")
                    return True
                else:
                    print(f"❌ ファイルサイズが0: {destination}")
            else:
                print(f"❌ ファイルが存在しません: {destination}")

        except Exception as e:
            print(f"❌ requestsでのダウンロード失敗: {e}")
            print(f"エラータイプ: {type(e).__name__}")

        # 方法3: 直接ダウンロードリンクを使用
        try:
            direct_url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t"
            print(f"方法3: 直接ダウンロードで試行中: {direct_url}")

            response = requests.get(direct_url, stream=True)
            print(f"直接ダウンロードレスポンスステータス: {response.status_code}")
            response.raise_for_status()

            total_size = 0
            with open(destination, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        total_size += len(chunk)
                        if total_size % (1024 * 1024) == 0:  # 1MBごとにログ
                            print(f"直接ダウンロード進行中: {total_size / (1024 * 1024):.1f}MB")

            if os.path.exists(destination):
                file_size = os.path.getsize(destination)
                print(f"ファイル存在確認: {destination} (サイズ: {file_size} bytes)")
                if file_size > 0:
                    print(f"✅ 直接ダウンロード成功: {destination}")
                    return True
                else:
                    print(f"❌ ファイルサイズが0: {destination}")
            else:
                print(f"❌ ファイルが存在しません: {destination}")

        except Exception as e:
            print(f"❌ 直接ダウンロード失敗: {e}")
            print(f"エラータイプ: {type(e).__name__}")

        print("❌ すべてのダウンロード方法が失敗しました")
        return False

    except Exception as e:
        print(f"❌ ダウンロードエラー: {e}")
        print(f"エラータイプ: {type(e).__name__}")
        return False

def extract_zip(zip_path: str, extract_to: str) -> bool:
    """ZIPファイルを展開する"""
    print(f"=== ZIP展開開始 ===")
    print(f"ZIPファイル: {zip_path}")
    print(f"展開先: {extract_to}")

    try:
        if not os.path.exists(zip_path):
            print(f"❌ ZIPファイルが存在しません: {zip_path}")
            return False

        zip_size = os.path.getsize(zip_path)
        print(f"ZIPファイルサイズ: {zip_size} bytes")

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            file_list = zip_ref.namelist()
            print(f"ZIP内のファイル数: {len(file_list)}")
            print(f"ZIP内のファイル一覧: {file_list}")

            zip_ref.extractall(extract_to)

        print(f"✅ 展開完了: {zip_path} -> {extract_to}")

        # 展開後の確認
        if os.path.exists(extract_to):
            extracted_files = list(Path(extract_to).rglob("*"))
            print(f"展開後のファイル数: {len(extracted_files)}")
            for file_path in extracted_files:
                if file_path.is_file():
                    print(f"  - {file_path} ({file_path.stat().st_size} bytes)")

        return True
    except Exception as e:
        print(f"❌ 展開エラー: {e}")
        print(f"エラータイプ: {type(e).__name__}")
        return False

def setup_models():
    """必要なモデルをセットアップする"""
    print("=" * 60)
    print("🚀 モデルセットアップ開始")
    print("=" * 60)
    print(f"現在の作業ディレクトリ: {os.getcwd()}")
    print(f"Pythonバージョン: {sys.version}")

    # モデルディレクトリの作成
    models_dir = Path("benchmarks/LRS3/models")
    lm_dir = Path("benchmarks/LRS3/language_models")

    print(f"モデルディレクトリ作成: {models_dir}")
    models_dir.mkdir(parents=True, exist_ok=True)
    print(f"言語モデルディレクトリ作成: {lm_dir}")
    lm_dir.mkdir(parents=True, exist_ok=True)

    # Google DriveのファイルID（実際のファイルID）
    model_file_id = "1p8CWMA1JghP8m57xeZdunPQZLu2aEgt_"  # LRS3_V_WER19.1
    lm_file_id = "1XC-mIHiCwypsE5W4XIwnrAIq71Cr6JmA"     # lm_en_subword

    print(f"LRS3モデルファイルID: {model_file_id}")
    print(f"言語モデルファイルID: {lm_file_id}")

    # モデルが既に存在するかチェック
    model_path = models_dir / "LRS3_V_WER19.1"
    lm_path = lm_dir / "lm_en_subword"

    model_exists = model_path.exists()
    lm_exists = lm_path.exists()

    print(f"LRS3モデル存在確認: {model_exists} ({model_path})")
    print(f"言語モデル存在確認: {lm_exists} ({lm_path})")

    success_count = 0
    total_count = 2

    # LRS3モデルのダウンロード
    if not model_exists:
        print("\n" + "=" * 40)
        print("📥 LRS3_V_WER19.1モデルをダウンロード中...")
        print("=" * 40)
        model_zip = "LRS3_V_WER19.1.zip"

        if download_file_from_gdrive(model_file_id, model_zip):
            print(f"✅ ダウンロード成功: {model_zip}")
            if extract_zip(model_zip, models_dir):
                print(f"✅ 展開成功: {model_zip} -> {models_dir}")
                try:
                    os.remove(model_zip)  # ZIPファイルを削除
                    print(f"✅ ZIPファイル削除: {model_zip}")
                except Exception as e:
                    print(f"⚠️ ZIPファイル削除失敗: {e}")
                print("🎉 LRS3_V_WER19.1モデルのセットアップが完了しました")
                success_count += 1
            else:
                print("❌ モデルの展開に失敗しました")
        else:
            print("❌ LRS3_V_WER19.1モデルのダウンロードに失敗しました")
    else:
        print("✅ LRS3_V_WER19.1モデルは既に存在します")
        success_count += 1

    # 言語モデルのダウンロード
    if not lm_exists:
        print("\n" + "=" * 40)
        print("📥 lm_en_subwordモデルをダウンロード中...")
        print("=" * 40)
        lm_zip = "lm_en_subword.zip"

        if download_file_from_gdrive(lm_file_id, lm_zip):
            print(f"✅ ダウンロード成功: {lm_zip}")
            if extract_zip(lm_zip, lm_dir):
                print(f"✅ 展開成功: {lm_zip} -> {lm_dir}")
                try:
                    os.remove(lm_zip)  # ZIPファイルを削除
                    print(f"✅ ZIPファイル削除: {lm_zip}")
                except Exception as e:
                    print(f"⚠️ ZIPファイル削除失敗: {e}")
                print("🎉 lm_en_subwordモデルのセットアップが完了しました")
                success_count += 1
            else:
                print("❌ 言語モデルの展開に失敗しました")
        else:
            print("❌ lm_en_subwordモデルのダウンロードに失敗しました")
    else:
        print("✅ lm_en_subwordモデルは既に存在します")
        success_count += 1

    # 最終確認
    print("\n" + "=" * 60)
    print("📋 最終確認")
    print("=" * 60)

    final_model_exists = (models_dir / "LRS3_V_WER19.1").exists()
    final_lm_exists = (lm_dir / "lm_en_subword").exists()

    print(f"LRS3モデル最終確認: {final_model_exists}")
    print(f"言語モデル最終確認: {final_lm_exists}")
    print(f"成功数: {success_count}/{total_count}")

    if final_model_exists and final_lm_exists:
        print("🎉 すべてのモデルが準備完了しています！")
        return True
    else:
        print("❌ 一部のモデルが準備できていません")
        return False

if __name__ == "__main__":
    setup_models()
