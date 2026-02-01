// src/components/tetris/Statistics.tsx
import React from "react";
import { PieceStatistics, TetrominoType } from "@/types";
import { TETROMINO_TYPES } from "@/lib/constants";
import TetrominoPreview from "./TetrominoPreview";

interface StatisticsProps {
  statistics: PieceStatistics;
  className?: string;
}

const Statistics: React.FC<StatisticsProps> = ({ statistics, className = "" }) => {
  const total = TETROMINO_TYPES.reduce((sum, type) => sum + statistics[type], 0);

  return (
    <div className={`${className}`}>
      <h2 className="mb-2 text-sm font-semibold text-gray-300">Statistics</h2>
      <div className="bg-gray-800 p-2 rounded-sm space-y-1">
        {TETROMINO_TYPES.map((type: TetrominoType) => (
          <div key={type} className="flex items-center justify-between gap-2">
            <div className="w-12 h-6 flex items-center justify-center">
              <TetrominoPreview piece={type} variant="stats" />
            </div>
            <span className="font-mono text-sm text-white">
              {String(statistics[type]).padStart(3, "0")}
            </span>
          </div>
        ))}
        <div className="border-t border-gray-700 pt-1 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Total</span>
            <span className="font-mono text-sm text-white">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Statistics);
