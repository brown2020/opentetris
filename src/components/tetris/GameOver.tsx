// src/components/tetris/GameOver.tsx
import React from "react";
import { Button } from "@/components/ui/Button";
import { RotateCcw } from "lucide-react";

interface GameOverProps {
  score: number;
  onRestart: () => void;
  highScore?: number;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart, highScore }) => {
  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over</h2>

        <div className="space-y-2 mb-6">
          <p className="text-xl text-white">
            Final Score: <span className="font-bold">{score}</span>
          </p>
          {highScore !== undefined && (
            <p className="text-sm text-gray-400">
              High Score: <span className="font-bold">{highScore}</span>
            </p>
          )}
        </div>

        <Button onClick={onRestart} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOver;
