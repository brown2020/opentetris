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
  const preview = pieces.slice(0, maxPieces);
  const seen: Record<string, number> = {};

  return (
    <div className={className}>
      <h2 className="mb-2 text-sm font-semibold text-gray-300">Next</h2>
      <ul className="flex flex-col gap-2 list-none p-0 m-0" aria-label="Next pieces">
        {preview.map((piece, slot) => {
          const occurrence = (seen[piece] ?? 0) + 1;
          seen[piece] = occurrence;
          return (
            <li key={`${piece}-${occurrence}`}>
              <TetrominoPreview
                piece={piece}
                variant={slot === 0 ? "next-main" : "next-secondary"}
                level={level}
                colorTheme={colorTheme}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(NextPiece);
