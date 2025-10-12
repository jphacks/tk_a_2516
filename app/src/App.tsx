import { useState, useEffect } from 'react'
import SentenceDisplay from './components/SentenceDisplay'
import VideoRecorder from './components/VideoRecorder'
import ScoreDisplay from './components/ScoreDisplay'
import TranscriptionDisplay from './components/TranscriptionDisplay'
import ProgressBar from './components/ProgressBar'
import InfoDialog from './components/InfoDialog'
import { evaluatePronunciation, type ScoreBreakdown } from './utils/scoring'

type AppState = 'ready' | 'recording' | 'processing' | 'result'

function App() {
  const [appState, setAppState] = useState<AppState>('ready')
  const [currentSentence, setCurrentSentence] = useState(0)
  const [sentence, setSentence] = useState<string>('')
  const [score, setScore] = useState<number | null>(null)
  const [scoreDetails, setScoreDetails] = useState<ScoreBreakdown | null>(null)
  const [transcribedText, setTranscribedText] = useState<string>('')
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)


  useEffect(() => {
    fetchRandomSentence()
  }, [])

  const fetchRandomSentence = async () => {
    try {
      const response = await fetch('http://localhost:8000/random-sentence')
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.text()
      setSentence(data)
    } catch (error) {
      console.error('Failed to fetch random sentence:', error)
      // Fallback to a default sentence
      setSentence('Hello, how are you today?')
    }
  }

  const handleStartRecording = () => {
    setAppState('recording')
  }

  const handleStopRecording = async (videoBlob: Blob) => {
    setAppState('processing')

    try {
      const formData = new FormData()
      formData.append('file', videoBlob, 'recording.webm')

      const response = await fetch('http://localhost:8000/infer-video', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const transcription: string = data.transcription ?? ''
      setTranscribedText(transcription)

      const originalText = sentence
      const evaluation = evaluatePronunciation(originalText, transcription)

      setScore(evaluation.score)
      setScoreDetails(evaluation)
      setAppState('result')
    } catch (error) {
      console.error('Scoring error:', error)
      setScore(null)
      setScoreDetails(null)
      setAppState('ready')
    }
  }

  const handleNextSentence = () => {
    if (currentSentence < 4) {
      setCurrentSentence(currentSentence + 1)
    } else {
      setCurrentSentence(0)
    }
    fetchRandomSentence()

    setScore(null)
    setScoreDetails(null)
    setTranscribedText('')
    setAppState('ready')
  }

  const handleRetry = () => {
    setScore(null)
    setScoreDetails(null)
    setTranscribedText('')
    setAppState('ready')
  }

  const handleOpenInfoDialog = () => {
    setIsInfoDialogOpen(true)
  }

  const handleCloseInfoDialog = () => {
    setIsInfoDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 max-w-md">
        <ProgressBar current={currentSentence + 1} total={5} />
        <div className="text-center mb-4 relative">
          <h1 className="inline-flex items-center gap-2 text-xl font-bold text-gray-800">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white text-base font-semibold">
              SS
            </span>
            <span>SilentSpeaking</span>
          </h1>
          <button
            onClick={handleOpenInfoDialog}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Show instructions"
          >
            <i className="fa-solid fa-circle-info text-xl"></i>
          </button>
        </div>

        {appState !== 'result' ? (
          <div className="space-y-4">
            <SentenceDisplay
              sentence={sentence}
              isVisible={appState === 'ready' || appState === 'recording'}
            />

            <VideoRecorder
              isRecording={appState === 'recording'}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              isProcessing={appState === 'processing'}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {transcribedText && (
              <TranscriptionDisplay
                originalSentence={sentence}
                transcribedText={transcribedText}
                isVisible
              />
            )}

            {score !== null && scoreDetails && (
              <ScoreDisplay
                score={score}
                details={scoreDetails}
                onNext={handleNextSentence}
                onRetry={handleRetry}
                isLastSentence={currentSentence === 4}
              />
            )}
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-500">

          <p>電車の中でも気軽に発音練習</p>

        </div>
      </div>

      <InfoDialog isOpen={isInfoDialogOpen} onClose={handleCloseInfoDialog} />
    </div>
  )
}

export default App
