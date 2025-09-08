// src/components/tetris/NextPiece.tsx
import React from "react";
import { TetrominoType } from "@/types";
import { PREVIEW_PIECES } from "@/lib/constants";
import PreviewBox from "./PreviewBox";

interface NextPieceProps {
  pieces: TetrominoType[];
  className?: string;
}

const NextPiece: React.FC<NextPieceProps> = ({ pieces, className = "" }) => {
  return (
    <div className={className}>
      <h2 className="mb-2 text-sm font-semibold text-gray-300">Next</h2>
      <div className="flex flex-col gap-2">
        {pieces.slice(0, PREVIEW_PIECES).map((piece, index) => (
          <PreviewBox key={index} piece={piece} isMainPreview={index === 0} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(NextPiece);
