import React from 'react'
import { type ScoreBreakdown } from '../utils/scoring'

interface ScoreDisplayProps {
  score: number
  details: ScoreBreakdown
  onNext: () => void
  onRetry: () => void
  isLastSentence: boolean
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  details,
  onNext,
  onRetry,
  isLastSentence
}) => {
  const getScoreInfo = (value: number) => {
    if (value >= 90) {
      return {
        grade: 'とてもよくできました',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: 'A+',
        message: '口の動きがほぼ完璧に一致しています。'
      }
    }
    if (value >= 80) {
      return {
        grade: 'かなり良いです',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: 'A',
        message: 'わずかなズレだけで、とても精度の高い発音です。'
      }
    }
    if (value >= 70) {
      return {
        grade: 'まずまず',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: 'B',
        message: 'いくつか抜けがあるものの、全体として伝わります。'
      }
    }
    return {
      grade: 'もう少し練習',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: 'C',
      message: '口の形とタイミングを意識して再挑戦しましょう。'
    }
  }

  const scoreInfo = getScoreInfo(score)
  const precisionPercent = Math.round(details.precision * 100)
  const recallPercent = Math.round(details.recall * 100)
  const matchedWords = details.matchedCount
  const missedWords = Math.max(details.totalReference - matchedWords, 0)
  const extraWords = Math.max(details.totalHypothesis - matchedWords, 0)
  const referenceSummary = details.totalReference > 0
    ? `${matchedWords}/${details.totalReference}`
    : 'n/a'

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <div className="text-center">
        <div className={`${scoreInfo.bgColor} ${scoreInfo.borderColor} border-2 rounded-lg p-3 mb-3`}>
          <div className="text-2xl mb-1">{scoreInfo.icon}</div>
          <div className={`text-2xl font-bold ${scoreInfo.color} mb-1`}>
            {score}
          </div>
          <div className={`text-sm font-semibold ${scoreInfo.color}`}>
            {scoreInfo.grade}
          </div>
          <p className="text-xs text-gray-600 mt-1">{scoreInfo.message}</p>
        </div>

        <div className="mb-3">
          <div className="bg-gray-50 rounded p-2">
            <ul className="text-xs text-gray-700 space-y-1 text-left">
              <li>再現率: {recallPercent}% ({referenceSummary})</li>
              <li>適合率: {precisionPercent}% {extraWords > 0 ? `(余分 ${extraWords} 語)` : '(余分なし)'}</li>
              {missedWords > 0 ? (
                <li className="text-orange-600">認識されなかった語: {missedWords}</li>
              ) : (
                <li className="text-green-600">提示された単語をすべてカバーできました。</li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          {!isLastSentence ? (
            <button
              onClick={onNext}
              className="w-full bg-primary-500 text-white py-2 px-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2 text-sm"
            >

              <span>&gt;&gt;</span>

              <span>次の例文へ</span>
            </button>
          ) : (
            <button
              onClick={onNext}
              className="w-full bg-green-500 text-white py-2 px-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <span>*</span>
              <span>最初からやり直す</span>
            </button>
          )}

          <button
            onClick={onRetry}
            className="w-full bg-gray-500 text-white py-2 px-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm"
          >

            <span>R</span>

            <span>もう一度挑戦</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay
