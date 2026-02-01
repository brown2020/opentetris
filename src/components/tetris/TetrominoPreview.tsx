// src/components/tetris/TetrominoPreview.tsx
import React, { useMemo } from "react";
import { TetrominoType, ColorTheme } from "@/types";
import { TETROMINO_SHAPES, TETROMINO_COLORS } from "@/lib/constants";
import { getPieceColor, getLighterColor, getDarkerColor } from "@/lib/utils";

type PreviewVariant = "hold" | "next-main" | "next-secondary" | "stats";

interface TetrominoPreviewProps {
  piece: TetrominoType | null;
  variant?: PreviewVariant;
  level?: number;
  colorTheme?: ColorTheme;
  className?: string;
}

// Variant config type
interface VariantConfig {
  cellSize: string;
  containerClass: string;
  opacity: number;
  scale: string;
}

// Base config shared between hold and next-main
const BASE_CONFIG: VariantConfig = {
  cellSize: "w-4 h-4",
  containerClass: "p-2 bg-gray-900 rounded border border-gray-700",
  opacity: 1,
  scale: "",
};

// Pre-computed variant styles
const VARIANT_CONFIG: Record<PreviewVariant, VariantConfig> = {
  hold: BASE_CONFIG,
  "next-main": BASE_CONFIG,
  "next-secondary": {
    cellSize: "w-3 h-3",
    containerClass: "p-1.5 bg-gray-900 rounded border border-gray-700",
    opacity: 0.7,
    scale: "scale-90",
  },
  stats: {
    cellSize: "w-2 h-2",
    containerClass: "",
    opacity: 1,
    scale: "",
  },
};

// Pre-compute active cell classes for each tetromino type (modern theme)
const ACTIVE_CELL_CLASSES = Object.fromEntries(
  Object.entries(TETROMINO_COLORS).map(([type, colors]) => [
    type,
    `${colors.bg} border-t-white/20 border-l-white/20 border-r-black/20 border-b-black/20`,
  ])
) as Record<TetrominoType, string>;

const EMPTY_CELL_CLASS = "bg-gray-800 border-gray-700";

const TetrominoPreview: React.FC<TetrominoPreviewProps> = ({
  piece,
  variant = "next-main",
  level = 0,
  colorTheme = "modern",
  className = "",
}) => {
  const config = VARIANT_CONFIG[variant];

  // Memoize center offset calculation (always center pieces)
  const centerOffset = useMemo(() => {
    if (!piece) return { x: 0, y: 0 };

    const shape = TETROMINO_SHAPES[piece];
    let minRow = 4,
      maxRow = 0,
      minCol = 4,
      maxCol = 0;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          minRow = Math.min(minRow, row);
          maxRow = Math.max(maxRow, row);
          minCol = Math.min(minCol, col);
          maxCol = Math.max(maxCol, col);
        }
      }
    }

    return {
      x: Math.floor((4 - (maxCol - minCol + 1)) / 2),
      y: Math.floor((4 - (maxRow - minRow + 1)) / 2),
    };
  }, [piece]);

  // Get NES/Gameboy colors if needed
  const nesColors = useMemo(() => {
    if (!piece || colorTheme === "modern") return null;
    const baseColor = getPieceColor(piece, level, colorTheme);
    return {
      base: baseColor,
      light: getLighterColor(baseColor),
      dark: getDarkerColor(baseColor),
    };
  }, [piece, level, colorTheme]);

  // Memoize grid cells to avoid recreation on each render
  const gridCells = useMemo(() => {
    const shape = piece ? TETROMINO_SHAPES[piece] : null;

    return Array.from({ length: 16 }).map((_, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;

      const pieceRow = row - centerOffset.y;
      const pieceCol = col - centerOffset.x;
      const isActive = piece && shape?.[pieceRow]?.[pieceCol] === 1;

      // For stats variant with no piece, just return empty/invisible
      if (variant === "stats" && !isActive) {
        return (
          <div
            key={index}
            className={config.cellSize}
            style={{ visibility: "hidden" }}
          />
        );
      }

      // Use NES/Gameboy colors
      if (nesColors && isActive) {
        return (
          <div
            key={index}
            className={`${config.cellSize} border`}
            style={{
              backgroundColor: nesColors.base,
              borderTopColor: nesColors.light,
              borderLeftColor: nesColors.light,
              borderRightColor: nesColors.dark,
              borderBottomColor: nesColors.dark,
            }}
          />
        );
      }

      // Modern theme
      return (
        <div
          key={index}
          className={`${config.cellSize} border ${
            isActive ? ACTIVE_CELL_CLASSES[piece!] : EMPTY_CELL_CLASS
          }`}
        />
      );
    });
  }, [piece, centerOffset, config.cellSize, nesColors, variant]);

  // Stats variant has minimal wrapper
  if (variant === "stats") {
    return (
      <div className={`grid grid-cols-4 gap-0 ${className}`}>
        {gridCells}
      </div>
    );
  }

  return (
    <div
      className={`${config.containerClass} ${config.scale} ${className}`}
      style={{ opacity: config.opacity }}
    >
      <div className="grid grid-cols-4 gap-0.5">{gridCells}</div>
    </div>
  );
};

export default React.memo(TetrominoPreview);
