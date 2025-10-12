import { useState } from 'react'
import SentenceDisplay from './components/SentenceDisplay'
import VideoRecorder from './components/VideoRecorder'
import ScoreDisplay from './components/ScoreDisplay'
import TranscriptionDisplay from './components/TranscriptionDisplay'
import ProgressBar from './components/ProgressBar'
import InfoDialog from './components/InfoDialog'

// アプリの状態管理
type AppState = 'ready' | 'recording' | 'processing' | 'result'

function App() {
  const [appState, setAppState] = useState<AppState>('ready')
  const [currentSentence, setCurrentSentence] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [transcribedText, setTranscribedText] = useState<string>('')
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)

  // サンプル例文（MVP用）
  const sentences = [
    "Hello, how are you today?",
    "I would like to order a coffee.",
    "Thank you very much for your help.",
    "Could you please repeat that?",
    "I'm sorry, I don't understand."
  ]

  const handleStartRecording = () => {
    setAppState('recording')
  }

  const handleStopRecording = async (videoBlob: Blob) => {
    setAppState('processing')

    try {
      const formData = new FormData()
      formData.append('file', videoBlob, 'video.mp4')

      const response = await fetch('http://localhost:8000/infer-video', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const transcription = data.transcription
      setTranscribedText(transcription)

      // スコア計算部分はそのまま保持
      const originalText = sentences[currentSentence]
      const originalWords = originalText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 0)

      const transcribedWords = transcription.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 0)

      // ミス数に基づく点数計算
      const correctWords = transcribedWords.filter((word, index) =>
        word === originalWords[index]
      ).length
      const totalWords = originalWords.length

      // ミス数が少ないほど高得点（0ミス=100点、全ミス=0点）
      const scorePercentage = totalWords > 0 ? (correctWords / totalWords) * 100 : 0
      const calculatedScore = Math.round(scorePercentage)

      console.log(`正解単語: ${correctWords}/${totalWords}, スコア: ${calculatedScore}点`) // デバッグ用

      setScore(calculatedScore)
      setAppState('result')
    } catch (error) {
      console.error('採点エラー:', error)
      setAppState('ready')
    }
  }

  const handleNextSentence = () => {
    if (currentSentence < sentences.length - 1) {
      setCurrentSentence(currentSentence + 1)
      setScore(null)
      setTranscribedText('')
      setAppState('ready')
    } else {
      // 全ての例文が終了
      setCurrentSentence(0)
      setScore(null)
      setTranscribedText('')
      setAppState('ready')
    }
  }

  const handleRetry = () => {
    setScore(null)
    setTranscribedText('')
    setAppState('ready')
  }

  // インフォメーションダイアログの開閉処理
  const handleOpenInfoDialog = () => {
    setIsInfoDialogOpen(true)
  }

  const handleCloseInfoDialog = () => {
    setIsInfoDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 max-w-md">
        <ProgressBar current={currentSentence + 1} total={sentences.length} />
        {/* ヘッダー */}
        <div className="text-center mb-4 relative">
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            英語発音チェッカー
          </h1>
          {/* インフォメーションアイコン */}
          <button
            onClick={handleOpenInfoDialog}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="アプリの使い方を表示"
          >
            <i className="fa-solid fa-circle-info text-xl"></i>
          </button>
        </div>

        {/* メインコンテンツ */}
        {appState !== 'result' ? (
          <div className="space-y-4">
            {/* 例文表示 */}
            <SentenceDisplay
              sentence={sentences[currentSentence]}
              isVisible={appState === 'ready' || appState === 'recording'}
            />

            {/* 録画エリア */}
            <VideoRecorder
              isRecording={appState === 'recording'}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              isProcessing={appState === 'processing'}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* 文字起こし結果表示 */}
            {transcribedText && (
              <TranscriptionDisplay
                originalSentence={sentences[currentSentence]}
                transcribedText={transcribedText}
                isVisible={true}
              />
            )}

            {/* 採点結果 */}
            {score !== null && (
              <ScoreDisplay
                score={score}
                onNext={handleNextSentence}
                onRetry={handleRetry}
                isLastSentence={currentSentence === sentences.length - 1}
              />
            )}
          </div>
        )}

        {/* フッター */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>電車の中でも気軽に発音練習</p>
        </div>
      </div>

      {/* インフォメーションダイアログ */}
      <InfoDialog
        isOpen={isInfoDialogOpen}
        onClose={handleCloseInfoDialog}
      />
    </div>
  )
}

export default App
