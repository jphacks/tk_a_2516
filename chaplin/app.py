from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import torch
import tempfile
import os
import random

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the model (simplified, using default config)
vsr_model = None
print("=" * 60)
print("🚀 アプリケーションを起動中...")
print("=" * 60)
print(f"現在の作業ディレクトリ: {os.getcwd()}")
print(f"PyTorchバージョン: {torch.__version__}")
print(f"CUDA利用可能: {torch.cuda.is_available()}")

# モデルファイルの存在確認
model_path = "benchmarks/LRS3/models/LRS3_V_WER19.1"
lm_path = "benchmarks/LRS3/language_models/lm_en_subword"

print(f"LRS3モデルパス: {model_path}")
print(f"言語モデルパス: {lm_path}")

# ディレクトリ構造の確認
print("\n📁 ディレクトリ構造確認:")
if os.path.exists("benchmarks"):
    print("✅ benchmarksディレクトリ存在")
    if os.path.exists("benchmarks/LRS3"):
        print("✅ benchmarks/LRS3ディレクトリ存在")
        if os.path.exists("benchmarks/LRS3/models"):
            print("✅ benchmarks/LRS3/modelsディレクトリ存在")
            models_files = os.listdir("benchmarks/LRS3/models")
            print(f"  models内のファイル: {models_files}")
        else:
            print("❌ benchmarks/LRS3/modelsディレクトリが存在しません")

        if os.path.exists("benchmarks/LRS3/language_models"):
            print("✅ benchmarks/LRS3/language_modelsディレクトリ存在")
            lm_files = os.listdir("benchmarks/LRS3/language_models")
            print(f"  language_models内のファイル: {lm_files}")
        else:
            print("❌ benchmarks/LRS3/language_modelsディレクトリが存在しません")
    else:
        print("❌ benchmarks/LRS3ディレクトリが存在しません")
else:
    print("❌ benchmarksディレクトリが存在しません")

# モデルの初期化
model_exists = os.path.exists(model_path)
lm_exists = os.path.exists(lm_path)

print(f"\n📋 モデル存在確認:")
print(f"LRS3モデル: {model_exists}")
print(f"言語モデル: {lm_exists}")

if model_exists and lm_exists:
    try:
        print("\n🔄 モデル初期化中...")
        from pipelines.pipeline import InferencePipeline
        vsr_model = InferencePipeline(
            "configs/LRS3_V_WER19.1.ini",
            device=torch.device("cuda:0" if torch.cuda.is_available() else "cpu"),
            detector="mediapipe",
            face_track=True
        )
        print("✅ モデルの初期化が完了しました")
    except Exception as e:
        print(f"❌ モデルの初期化に失敗しました: {e}")
        print(f"エラータイプ: {type(e).__name__}")
        vsr_model = None
else:
    print(f"❌ モデルファイルが見つかりません")
    print(f"  LRS3モデル: {model_path} ({'存在' if model_exists else '不存在'})")
    print(f"  言語モデル: {lm_path} ({'存在' if lm_exists else '不存在'})")
    print("⚠️ モデルなしでアプリケーションを起動します")

with open("./assets/tatoeba.tsv", "rt", encoding="utf-8") as fin:
    sentences = [
        s.split("\t")[1]
        for s in fin.read().split("\n")
        if s != ""
    ]

@app.post("/infer-video")
async def infer_video(file: UploadFile = File(...)):
    if vsr_model is None:
        return {"error": "モデルが初期化されていません。モデルファイルを確認してください。"}

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        # Perform inference
        output = vsr_model(temp_path)
        return {"filename": file.filename, "transcription": output}
    except Exception as e:
        return {"error": f"推論エラー: {str(e)}"}
    finally:
        # Clean up temp file
        os.unlink(temp_path)

@app.get("/random-sentence")
def random_sentence():
    return random.choice(sentences)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": vsr_model is not None,
        "message": "アプリケーションは正常に動作しています"
    }

@app.get("/")
def root():
    return {
        "message": "Visual Speech Recognition API",
        "status": "running",
        "model_loaded": vsr_model is not None
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
