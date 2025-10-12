from fastapi import FastAPI, UploadFile, File
import uvicorn
import base64
import torch
from pipelines.pipeline import InferencePipeline
import tempfile
import os

app = FastAPI()

# Initialize the model (simplified, using default config)
vsr_model = InferencePipeline(
    "configs/LRS3_V_WER19.1.ini",  # Replace with actual config path if needed
    device=torch.device("cuda:0" if torch.cuda.is_available() else "cpu"),
    detector="mediapipe",  # Example detector
    face_track=True
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/post-test")
def post_test():
    return {"message": "test!"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    return {"filename": file.filename, "content": content.decode("utf-8")}

@app.post("/infer-video")
async def infer_video(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        # Perform inference
        output = vsr_model(temp_path)
        return {"filename": file.filename, "transcription": output}
    finally:
        # Clean up temp file
        os.unlink(temp_path)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
