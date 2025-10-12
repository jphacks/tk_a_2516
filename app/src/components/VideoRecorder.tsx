import React, { useRef, useEffect, useState } from "react";

interface VideoRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (videoBlob: Blob) => void;
  isProcessing: boolean;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  isProcessing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // カメラアクセス許可の確認
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // フロントカメラ
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false, // 音声は不要（口の動きのみ）
        });
        setHasPermission(true);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("カメラアクセスエラー:", error);
        setHasPermission(false);
      }
    };

    checkCameraPermission();

    // クリーンアップ
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 録画開始
  const startRecording = async () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp8",
      });

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: "video/webm" });
        onStopRecording(videoBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // 100ms間隔でデータを取得
      onStartRecording();

      // 録画時間のカウント
      const startTime = Date.now();
      const timer = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // 5秒後に自動停止
      setTimeout(() => {
        clearInterval(timer);
        stopRecording();
      }, 5000);
    } catch (error) {
      console.error("録画開始エラー:", error);
    }
  };

  // 録画停止
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // カメラ許可が拒否された場合
  if (hasPermission === false) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">📷</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            カメラアクセスが必要です
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            口の動きを認識するためにカメラの使用を許可してください
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // カメラ読み込み中
  if (hasPermission === null) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          <div className="animate-spin text-primary-500 text-4xl mb-4">
            <i className="fa-solid fa-spinner"></i>
          </div>
          <p className="text-gray-600">カメラを準備中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* カメラ映像 */}
      <div className="relative bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-64 object-cover"
        />

        {/* 録画中のオーバーレイ */}
        {isRecording && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">録画中... {recordingTime}s</span>
            </div>
          </div>
        )}

        {/* 処理中のオーバーレイ */}
        {isProcessing && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span className="font-semibold">採点中...</span>
            </div>
          </div>
        )}
      </div>

      {/* コントロールボタン */}
      <div className="p-6">
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            className="w-14 h-14 bg-primary-500 text-white py-3 px-3 rounded-full font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center mx-auto"
          >
            <i className="fa-solid fa-microphone"></i>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="w-14 h-14 bg-red-500 text-white py-3 px-3 rounded-full font-semibold hover:bg-red-600 transition-colors flex items-center justify-center mx-auto"
          >
            <i className="fa-solid fa-pause"></i>
          </button>
        )}

        <p className="text-xs text-gray-500 text-center mt-3">
          {isRecording
            ? "5秒間録画します"
            : "口の動きを5秒間録画して発音を判定します"}
        </p>
      </div>
    </div>
  );
};

export default VideoRecorder;
