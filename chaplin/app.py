from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import torch
from pipelines.pipeline import InferencePipeline
import tempfile
import os
import cv2
from typing import Tuple

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _convert_video_to_mp4(source_path: str) -> Tuple[str, float]:
    """
    Convert an uploaded video to an mp4 file that OpenCV can consume.

    Returns the path to the converted file and the inferred fps.
    """
    capture = cv2.VideoCapture(source_path)
    if not capture.isOpened():
        raise ValueError("Failed to read uploaded video.")

    fps = capture.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 25.0  # fall back to a reasonable default

    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    if width == 0 or height == 0:
        capture.release()
        raise ValueError("Could not determine video dimensions.")

    temp_target = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    temp_target_path = temp_target.name
    temp_target.close()

    writer = cv2.VideoWriter(
        temp_target_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    try:
        while True:
            ret, frame = capture.read()
            if not ret:
                break
            writer.write(frame)
    finally:
        capture.release()
        writer.release()

    return temp_target_path, fps

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
    original_suffix = os.path.splitext(file.filename or "")[1].lower()
    if not original_suffix:
        original_suffix = ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=original_suffix) as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    processed_path = temp_path

    try:
        if original_suffix not in {".mp4", ".m4v"}:
            try:
                processed_path, _ = _convert_video_to_mp4(temp_path)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc))

        # Perform inference
        output = vsr_model(processed_path)
        return {"filename": file.filename, "transcription": output}
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        if processed_path != temp_path and os.path.exists(processed_path):
            os.unlink(processed_path)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
