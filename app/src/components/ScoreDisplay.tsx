import React from 'react'

interface ScoreDisplayProps {
  score: number
  onNext: () => void
  onRetry: () => void
  isLastSentence: boolean
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  onNext, 
  onRetry, 
  isLastSentence
}) => {
  // スコアに基づく評価と色の決定
  const getScoreInfo = (score: number) => {
    if (score >= 90) {
      return {
        grade: 'Excellent!',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        emoji: '🎉',
        message: '完璧な発音です！'
      }
    } else if (score >= 80) {
      return {
        grade: 'Great!',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        emoji: '👏',
        message: 'とても良い発音です！'
      }
    } else if (score >= 70) {
      return {
        grade: 'Good!',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        emoji: '👍',
        message: '良い発音です！'
      }
    } else {
      return {
        grade: 'Keep practicing!',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        emoji: '💪',
        message: 'もう少し練習しましょう！'
      }
    }
  }

  const scoreInfo = getScoreInfo(score)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <div className="text-center">
        {/* スコア表示 - 適度にコンパクト */}
        <div className={`${scoreInfo.bgColor} ${scoreInfo.borderColor} border-2 rounded-lg p-3 mb-3`}>
          <div className="text-2xl mb-1">{scoreInfo.emoji}</div>
          <div className={`text-2xl font-bold ${scoreInfo.color} mb-1`}>
            {score}点
          </div>
          <div className={`text-sm font-semibold ${scoreInfo.color}`}>
            {scoreInfo.grade}
          </div>
        </div>

        {/* フィードバック - コンパクト */}
        <div className="mb-3">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-700">
              {score >= 80 ? (
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-green-500">✓</span>
                  <span>発音が正確です</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-orange-500">!</span>
                  <span>口の動きを意識しましょう</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* アクションボタン - コンパクト */}
        <div className="space-y-2">
          {!isLastSentence ? (
            <button
              onClick={onNext}
              className="w-full bg-primary-500 text-white py-2 px-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <i className="fa-solid fa-arrow-right"></i>
              <span>次の例文へ</span>
            </button>
          ) : (
            <button
              onClick={onNext}
              className="w-full bg-green-500 text-white py-2 px-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <span>🏁</span>
              <span>最初からやり直す</span>
            </button>
          )}
          
          <button
            onClick={onRetry}
            className="w-full bg-gray-500 text-white py-2 px-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            <i className="fa-solid fa-rotate-right"></i>
            <span>もう一度挑戦</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay
