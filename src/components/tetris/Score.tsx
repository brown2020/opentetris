// src/components/tetris/Score.tsx
import React from "react";
import { Trophy, Target, Layers } from "lucide-react";

interface ScoreProps {
  score: number;
  level: number;
  lines: number;
  highScore?: number;
  className?: string;
}

const Score: React.FC<ScoreProps> = ({
  score,
  level,
  lines,
  highScore,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-2">
        {highScore !== undefined && (
          <div className="flex items-center justify-between text-amber-500">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              High Score
            </span>
            <span className="font-mono font-bold">{highScore}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Score
          </span>
          <span className="font-mono font-bold">{score}</span>
        </div>

        <div className="flex items-center justify-between text-green-500">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Lines
          </span>
          <span className="font-mono font-bold">{lines}</span>
        </div>
      </div>

      <div className="bg-gray-800 p-2 rounded text-center">
        <div className="text-sm text-gray-400">Level</div>
        <div className="text-2xl font-bold text-white">{level}</div>
      </div>
    </div>
  );
};

export default React.memo(Score);
