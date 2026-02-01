// src/components/tetris/Cell.tsx
import React from "react";
import { TetrominoType, ColorTheme } from "@/types";
import { TETROMINO_COLORS } from "@/lib/constants";
import { getPieceColor, getLighterColor, getDarkerColor } from "@/lib/utils";

// Pre-computed class maps for modern theme - avoids string concatenation on every render
const CELL_CLASSES = Object.fromEntries(
  Object.entries(TETROMINO_COLORS).map(([type, colors]) => [
    type,
    {
      ghost: `w-6 h-6 ${colors.bg} opacity-30 border-2 border-white/30`,
      active: `w-6 h-6 ${colors.bg} ${colors.border} border-2 brightness-110`,
      placed: `w-6 h-6 ${colors.bg} ${colors.border} border-2`,
    },
  ])
) as Record<TetrominoType, { ghost: string; active: string; placed: string }>;

const EMPTY_CELL_CLASS = "w-6 h-6 border border-gray-800 bg-gray-900";
const FLASH_CELL_CLASS = "w-6 h-6 bg-white";

interface CellProps {
  type: TetrominoType | null;
  isActive?: boolean;
  isGhost?: boolean;
  isClearing?: boolean;
  isFlashOn?: boolean;
  level?: number;
  colorTheme?: ColorTheme;
}

const Cell: React.FC<CellProps> = ({
  type,
  isActive = false,
  isGhost = false,
  isClearing = false,
  isFlashOn = false,
  level = 0,
  colorTheme = "modern",
}) => {
  // Line clear flash effect
  if (isClearing && isFlashOn) {
    return <div className={FLASH_CELL_CLASS} />;
  }

  if (!type) {
    return <div className={EMPTY_CELL_CLASS} />;
  }

  // Use NES or Gameboy colors
  if (colorTheme === "nes" || colorTheme === "gameboy") {
    const baseColor = getPieceColor(type, level, colorTheme);
    const lightColor = getLighterColor(baseColor);
    const darkColor = getDarkerColor(baseColor);

    const opacity = isGhost ? 0.3 : 1;
    const brightness = isActive ? 1.1 : 1;

    return (
      <div
        className="w-6 h-6 border-2"
        style={{
          backgroundColor: baseColor,
          borderTopColor: lightColor,
          borderLeftColor: lightColor,
          borderRightColor: darkColor,
          borderBottomColor: darkColor,
          opacity,
          filter: brightness !== 1 ? `brightness(${brightness})` : undefined,
        }}
      />
    );
  }

  // Modern theme - use pre-computed Tailwind classes
  const classes = CELL_CLASSES[type];
  const cellClass = isGhost
    ? classes.ghost
    : isActive
    ? classes.active
    : classes.placed;

  return <div className={cellClass} />;
};

export default React.memo(Cell);
