// ...existing code...
import React from "react";

interface ProgressBarProps {
  current: number; // 1-based
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const pct =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">
            {current}/{total}
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded"
            style={{ width: `${pct}%`, transition: "width 300ms ease" }}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
