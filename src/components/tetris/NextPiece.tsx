// src/components/tetris/NextPiece.tsx
import React from "react";
import { TetrominoType, ColorTheme } from "@/types";
import TetrominoPreview from "./TetrominoPreview";

interface NextPieceProps {
  pieces: TetrominoType[];
  maxPieces?: number;
  level?: number;
  colorTheme?: ColorTheme;
  className?: string;
}

const NextPiece: React.FC<NextPieceProps> = ({
  pieces,
  maxPieces = 3,
  level = 0,
  colorTheme = "modern",
  className = "",
}) => {
  return (
    <div className={className}>
      <h2 className="mb-2 text-sm font-semibold text-gray-300">Next</h2>
      <div className="flex flex-col gap-2">
        {pieces.slice(0, maxPieces).map((piece, index) => (
          <TetrominoPreview
            key={index}
            piece={piece}
            variant={index === 0 ? "next-main" : "next-secondary"}
            level={level}
            colorTheme={colorTheme}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(NextPiece);
