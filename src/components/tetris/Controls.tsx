// src/components/tetris/Controls.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Pause, 
  Play, 
  RotateCcw, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ArrowDown
} from 'lucide-react';

interface ControlsProps {
  onMove: (direction: 'left' | 'right' | 'down') => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  onReset: () => void;
  isPaused: boolean;
  gameOver: boolean;
  isMobile?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onMove,
  onRotate,
  onHardDrop,
  onPause,
  onReset,
  isPaused,
  gameOver,
  isMobile = false
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Game control buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="secondary"
          onClick={onPause}
          disabled={gameOver}
          className="w-24"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          )}
        </Button>

        <Button
          variant={gameOver ? "default" : "secondary"}
          onClick={onReset}
          className="w-24"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {gameOver ? 'New Game' : 'Reset'}
        </Button>
      </div>

      {/* Mobile controls */}
      {isMobile && !gameOver && !isPaused && (
        <div className="flex flex-col items-center gap-2">
          {/* Rotate button */}
          <Button
            variant="ghost"
            onClick={onRotate}
            className="w-12 h-12 rounded-full"
          >
            <ChevronUp className="w-6 h-6" />
          </Button>

          {/* Movement buttons */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onMove('left')}
              className="w-12 h-12 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => onMove('down')}
              className="w-12 h-12 rounded-full"
            >
              <ChevronDown className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => onMove('right')}
              className="w-12 h-12 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Hard drop button */}
          <Button
            variant="ghost"
            onClick={onHardDrop}
            className="w-12 h-12 rounded-full"
          >
            <ArrowDown className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Keyboard controls info */}
      <div className="text-sm text-gray-400">
        <h3 className="font-semibold mb-2">Controls:</h3>
        <ul className="space-y-1">
          <li>←/→ : Move left/right</li>
          <li>↓ : Move down</li>
          <li>↑ : Rotate</li>
          <li>Space : Hard drop</li>
          <li>P : Pause</li>
          <li>R : Reset</li>
        </ul>
      </div>
    </div>
  );
};

export default Controls;