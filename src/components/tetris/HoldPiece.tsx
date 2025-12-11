// src/components/tetris/HoldPiece.tsx
import React from "react";
import { TetrominoType } from "@/types";
import TetrominoPreview from "./TetrominoPreview";

interface HoldPieceProps {
  piece: TetrominoType | null;
  isLocked: boolean;
  className?: string;
}

const HoldPiece: React.FC<HoldPieceProps> = ({
  piece,
  isLocked,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="mb-2 text-sm font-semibold text-gray-300">Hold</div>
      <div className={isLocked ? "opacity-50" : ""}>
        <TetrominoPreview piece={piece} variant="hold" />
      </div>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-gray-400">Locked</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HoldPiece);
