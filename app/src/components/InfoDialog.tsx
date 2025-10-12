import { useEffect } from 'react'

// インフォメーションダイアログのプロパティ型定義
interface InfoDialogProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * アプリの使用方法を説明するモーダルダイアログコンポーネント
 *
 * @param isOpen - ダイアログの表示状態
 * @param onClose - ダイアログを閉じる際のコールバック関数
 */
function InfoDialog({ isOpen, onClose }: InfoDialogProps) {
  // ESCキーでダイアログを閉じる機能
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // スクロールを無効化（モーダル表示時）
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // ダイアログが閉じている場合は何も表示しない
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景オーバーレイ（クリックで閉じる） */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* ダイアログ本体 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            アプリの使い方
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="ダイアログを閉じる"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-4">
          {/* アプリの概要 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <i className="fa-solid fa-microphone text-blue-500 mr-2"></i>
              アプリについて
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              このアプリは口パクで英会話を練習するアプリです！
              口の動きを分析して、正確な発音ができているかを判定します。
              これにより、通勤中など声が出しづらい場面でもスピーキングの練習ができます。
            </p>
          </div>

          {/* 使用方法 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <i className="fa-solid fa-play-circle text-green-500 mr-2"></i>
              使い方
            </h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">1</span>
                表示された英文を声に出すつもりで口パクしてください
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">2</span>
                「録画開始」ボタンを押して、カメラに向かって話してください
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">3</span>
                5秒間録画します。それが終わると口の動きを分析して正しいかどうかを判定します。
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">4</span>
                発音の採点結果を確認してください
              </li>
            </ol>
          </div>

          {/* コツ */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <i className="fa-solid fa-lightbulb text-yellow-500 mr-2"></i>
              上達のコツ
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start">
                <i className="fa-solid fa-check text-green-500 mr-2 mt-0.5 text-xs"></i>
                口を大きく開けて口パクする
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-green-500 mr-2 mt-0.5 text-xs"></i>
                カメラに顔全体が映るようにする
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-green-500 mr-2 mt-0.5 text-xs"></i>
                明るい場所で使用する
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-green-500 mr-2 mt-0.5 text-xs"></i>
                何度も練習してスコアを向上させる
              </li>
            </ul>
          </div>

          {/* 注意事項 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <i className="fa-solid fa-exclamation-triangle text-orange-500 mr-2"></i>
              注意事項
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start">
                <i className="fa-solid fa-info-circle text-blue-500 mr-2 mt-0.5 text-xs"></i>
                カメラとマイクの許可が必要です
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-info-circle text-blue-500 mr-2 mt-0.5 text-xs"></i>
                電車の中でも気軽に練習できます
              </li>
            </ul>
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            理解しました
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoDialog
