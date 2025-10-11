import React from 'react'

interface SentenceDisplayProps {
  sentence: string
  isVisible: boolean
}

const SentenceDisplay: React.FC<SentenceDisplayProps> = ({ sentence, isVisible }) => {
  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-50'}`}>
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            読んでください
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-xl font-medium text-gray-800 leading-relaxed">
              "{sentence}"
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>カメラが口の動きを認識します</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SentenceDisplay
