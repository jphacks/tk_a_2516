export interface ScoreBreakdown {
  score: number
  precision: number
  recall: number
  matchedCount: number
  totalReference: number
  totalHypothesis: number
}

export const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const tokenize = (text: string): string[] => {
  if (!text) {
    return []
  }
  return normalizeText(text)
    .split(' ')
    .filter(Boolean)
}

export const longestCommonSubsequence = (reference: string[], hypothesis: string[]): number => {
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

  return dp[refLen][hypLen]
}

export const evaluatePronunciation = (referenceText: string, hypothesisText: string): ScoreBreakdown => {
  const referenceWords = tokenize(referenceText)
  const hypothesisWords = tokenize(hypothesisText)

  const matches = longestCommonSubsequence(referenceWords, hypothesisWords)
  const totalReference = referenceWords.length
  const totalHypothesis = hypothesisWords.length

  const precision = totalHypothesis > 0 ? matches / totalHypothesis : 0
  const recall = totalReference > 0 ? matches / totalReference : 0

  let f1 = 0
  if (precision > 0 || recall > 0) {
    f1 = (2 * precision * recall) / (precision + recall)
  }

  return {
    score: Math.round(f1 * 100),
    precision,
    recall,
    matchedCount: matches,
    totalReference,
    totalHypothesis
  }
}

