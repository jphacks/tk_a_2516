from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import torch
from pipelines.pipeline import InferencePipeline
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
try:
    vsr_model = InferencePipeline(
        "configs/LRS3_V_WER19.1.ini",  # Replace with actual config path if needed
        device=torch.device("cuda:0" if torch.cuda.is_available() else "cpu"),
        detector="mediapipe",  # Example detector
        face_track=True
    )
    print("モデルの初期化が完了しました")
except Exception as e:
    print(f"モデルの初期化に失敗しました: {e}")
    vsr_model = None

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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
