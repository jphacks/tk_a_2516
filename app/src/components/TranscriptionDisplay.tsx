import React from 'react'
import { tokenize, longestCommonSubsequence } from '../utils/scoring'

// LCS のバックトラックでマッチした reference のインデックスを取得
const getMatchedIndices = (reference: string[], hypothesis: string[]): Set<number> => {
  const refLen = reference.length
  const hypLen = hypothesis.length

  const dp: number[][] = Array.from({ length: refLen + 1 }, () =>
    Array.from({ length: hypLen + 1 }, () => 0)
  )

  for (let i = 1; i <= refLen; i += 1) {
    for (let j = 1; j <= hypLen; j += 1) {
      if (reference[i - 1] === hypothesis[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // バックトラックでマッチしたインデックスを収集
  const matched = new Set<number>()
  let i = refLen
  let j = hypLen
  while (i > 0 && j > 0) {
    if (reference[i - 1] === hypothesis[j - 1]) {
      matched.add(i - 1) // reference のインデックス
      i -= 1
      j -= 1
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i -= 1
    } else {
      j -= 1
    }
  }

  return matched
}

interface TranscriptionDisplayProps {
  originalSentence: string
  transcribedText: string
  isVisible: boolean
}

// 単語単位での比較と色分けを行う関数
const compareSentences = (original: string, transcribed: string) => {
  // 単語に分割（句読点を除去して小文字に変換）
  const splitIntoWords = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // 句読点を除去
      .split(/\s+/) // 空白で分割
      .filter(word => word.length > 0) // 空文字を除去
  }

  const originalWords = splitIntoWords(original)
  const transcribedWords = splitIntoWords(transcribed)

  // 単語の一致をチェック
  const comparison = originalWords.map((originalWord, index) => {
    const transcribedWord = transcribedWords[index]
    const isMatch = transcribedWord &&
      originalWord.toLowerCase() === transcribedWord.toLowerCase()

    return {
      word: originalWord,
      isCorrect: isMatch,
      transcribed: transcribedWord || ''
    }
  })

  return comparison
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  originalSentence,
  transcribedText,
  isVisible
}) => {
  const comparison = compareSentences(originalSentence, transcribedText)

  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-50'}`}>
      <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-200">
        <div className="text-center">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            文字起こし結果
          </h2>

          {/* 適度にコンパクトな比較表示 */}
          <div className="space-y-2">
            {/* 元の例文 */}
            <div>
              <div className="text-xs text-gray-600 mb-1">元の例文</div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-sm font-medium text-gray-800">
                  "{originalSentence}"
                </p>
              </div>
            </div>

            {/* 文字起こし結果 */}
            <div>
              <div className="text-xs text-gray-600 mb-1">認識結果</div>
              <div className="bg-blue-50 rounded p-2">
                <p className="text-sm font-medium text-gray-800">
                  "{transcribedText}"
                </p>
              </div>
            </div>

            {/* 単語比較 - 適度にコンパクト */}
            <div>
              <div className="text-xs text-gray-600 mb-1">単語比較</div>
              <div className="bg-gray-50 rounded p-2">
                <div className="flex flex-wrap gap-1 justify-center">
                  {comparison.map((item, index) => (
                    <span
                      key={index}
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        item.isCorrect
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                      title={item.isCorrect ? '正しい' : `誤り: "${item.transcribed}"`}
                    >
                      {item.word}
                    </span>
                  ))}
                </div>
                {/* 統計情報をコンパクトに表示 */}
                <div className="mt-2 flex justify-center space-x-3 text-xs">
                  <span className="text-green-600 font-medium">
                    ✓ {comparison.filter(item => item.isCorrect).length}正解
                  </span>
                  <span className="text-red-600 font-medium">
                    ✗ {comparison.filter(item => !item.isCorrect).length}誤り
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TranscriptionDisplay
