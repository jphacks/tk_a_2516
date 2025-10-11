import { useState } from 'react'
import SentenceDisplay from './components/SentenceDisplay'
import VideoRecorder from './components/VideoRecorder'
import ScoreDisplay from './components/ScoreDisplay'
import TranscriptionDisplay from './components/TranscriptionDisplay'

// アプリの状態管理
type AppState = 'ready' | 'recording' | 'processing' | 'result'

function App() {
  const [appState, setAppState] = useState<AppState>('ready')
  const [currentSentence, setCurrentSentence] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [transcribedText, setTranscribedText] = useState<string>('')

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
    
    // バックエンドに送信（MVPではモック）
    try {
      // 実際の実装では、ここでバックエンドAPIを呼び出し
      // videoBlobをバックエンドに送信して文字起こしと採点を行う
      console.log('Video blob size:', videoBlob.size) // デバッグ用
      
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒のモック処理
      
      // ランダムに文字起こし結果を生成（実際の認識精度をシミュレート）
      const originalText = sentences[currentSentence]
      const originalWords = originalText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 0)
      
      // 単語単位でランダムに誤りを生成
      const mockTranscribedWords = originalWords.map(word => {
        if (Math.random() > 0.7) { // 30%の確率で誤り
          // 単語の一部を変更
          const chars = word.split('')
          const randomIndex = Math.floor(Math.random() * chars.length)
          chars[randomIndex] = String.fromCharCode(97 + Math.floor(Math.random() * 26)) // ランダムな小文字
          return chars.join('')
        }
        return word
      })
      
      const mockTranscribed = mockTranscribedWords.join(' ')
      setTranscribedText(mockTranscribed)
      
      // ミス数に基づく点数計算
      const correctWords = mockTranscribedWords.filter((word, index) => 
        word.toLowerCase() === originalWords[index].toLowerCase()
      ).length
      const totalWords = originalWords.length
      
      // ミス数が少ないほど高得点（0ミス=100点、全ミス=0点）
      const scorePercentage = (correctWords / totalWords) * 100
      const mockScore = Math.round(scorePercentage)
      
      console.log(`正解単語: ${correctWords}/${totalWords}, スコア: ${mockScore}点`) // デバッグ用
      
      setScore(mockScore)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            英語発音チェッカー
          </h1>
          <p className="text-xs text-gray-600">
            口の動きで発音を判定します
          </p>
          <div className="mt-2 text-xs text-gray-500">
            {currentSentence + 1} / {sentences.length}
          </div>
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
    </div>
  )
}

export default App
