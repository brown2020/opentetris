import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Pause,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ArrowDown,
} from "lucide-react";

interface ControlsProps {
  onMove: (direction: "left" | "right" | "down") => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  onReset: () => void;
  isPaused: boolean;
  gameOver: boolean;
  isMobile?: boolean;
  isClassicMode?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onMove,
  onRotate,
  onHardDrop,
  onPause,
  onReset,
  isPaused,
  gameOver,
  isMobile = false,
  isClassicMode = false,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <Button
          variant="secondary"
          onClick={onPause}
          disabled={gameOver}
          className="w-24"
          aria-label={isPaused ? "Resume game" : "Pause game"}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 mr-2" aria-hidden="true" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-2" aria-hidden="true" />
              Pause
            </>
          )}
        </Button>

        <Button
          variant={gameOver ? "default" : "secondary"}
          onClick={onReset}
          className="w-24"
          aria-label={gameOver ? "Start new game" : "Reset game"}
        >
          <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
          {gameOver ? "New Game" : "Reset"}
        </Button>
      </div>

      {isMobile && !gameOver && !isPaused && (
        <div className="flex flex-col items-center gap-2" aria-label="Touch controls">
          <Button
            variant="ghost"
            onClick={onRotate}
            className="w-12 h-12 rounded-full"
            aria-label="Rotate piece"
          >
            <ChevronUp className="w-6 h-6" aria-hidden="true" />
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onMove("left")}
              className="w-12 h-12 rounded-full"
              aria-label="Move left"
            >
              <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => onMove("down")}
              className="w-12 h-12 rounded-full"
              aria-label="Soft drop"
            >
              <ChevronDown className="w-6 h-6" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => onMove("right")}
              className="w-12 h-12 rounded-full"
              aria-label="Move right"
            >
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onHardDrop}
            className="w-12 h-12 rounded-full"
            aria-label="Hard drop"
          >
            <ArrowDown className="w-6 h-6" aria-hidden="true" />
          </Button>
        </div>
      )}

      <div className="text-sm text-gray-400">
        <h3 className="font-semibold mb-2">Controls:</h3>
        <ul className="space-y-1">
          <li>←/→ : Move left/right</li>
          <li>↓ : Soft drop</li>
          <li>↑ : Rotate</li>
          {!isClassicMode && <li>Space : Hard drop</li>}
          {!isClassicMode && <li>C : Hold piece</li>}
          <li>P : Pause</li>
          <li>R : Reset</li>
        </ul>
      </div>
    </div>
  );
};

export default React.memo(Controls);
