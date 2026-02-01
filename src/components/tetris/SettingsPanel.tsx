// src/components/tetris/SettingsPanel.tsx
import React, { useState } from "react";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  GameSettings,
  DEFAULT_CLASSIC_SETTINGS,
  DEFAULT_MODERN_SETTINGS,
} from "@/types";

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  disabled?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleModeChange = (mode: "classic" | "modern") => {
    const preset = mode === "classic" ? DEFAULT_CLASSIC_SETTINGS : DEFAULT_MODERN_SETTINGS;
    onUpdateSettings(preset);
  };

  const handleStartingLevelChange = (level: number) => {
    onUpdateSettings({ startingLevel: level });
  };

  return (
    <div className="w-full max-w-md">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
        disabled={disabled}
      >
        <span className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Game Mode: {settings.mode === "classic" ? "Classic (NES)" : "Modern"}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isOpen && !disabled && (
        <div className="mt-2 p-4 bg-gray-800 rounded-md space-y-4">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Game Mode</label>
            <div className="flex gap-2">
              <Button
                variant={settings.mode === "classic" ? "default" : "secondary"}
                onClick={() => handleModeChange("classic")}
                className="flex-1"
              >
                Classic (NES)
              </Button>
              <Button
                variant={settings.mode === "modern" ? "default" : "secondary"}
                onClick={() => handleModeChange("modern")}
                className="flex-1"
              >
                Modern
              </Button>
            </div>
          </div>

          {/* Starting Level */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Starting Level: {settings.startingLevel}
            </label>
            <div className="flex gap-1 flex-wrap">
              {(settings.mode === "classic"
                ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
              ).map((level) => (
                <Button
                  key={level}
                  variant={settings.startingLevel === level ? "default" : "ghost"}
                  onClick={() => handleStartingLevelChange(level)}
                  className="w-8 h-8 p-0"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Mode Description */}
          <div className="text-xs text-gray-500 space-y-1">
            {settings.mode === "classic" ? (
              <>
                <p>NES Tetris authentic experience:</p>
                <ul className="list-disc list-inside">
                  <li>NES scoring (40/100/300/1200 x level+1)</li>
                  <li>NES speed curve</li>
                  <li>NES DAS timing</li>
                  <li>1 next piece preview</li>
                  <li>No hold piece or ghost piece</li>
                  <li>No wall kicks</li>
                  <li>Line clear animation</li>
                </ul>
              </>
            ) : (
              <>
                <p>Modern Guideline-style gameplay:</p>
                <ul className="list-disc list-inside">
                  <li>Modern scoring with drop bonuses</li>
                  <li>3 next piece preview</li>
                  <li>Hold piece and ghost piece</li>
                  <li>SRS rotation with wall kicks</li>
                  <li>7-bag randomizer</li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {disabled && (
        <p className="text-xs text-gray-500 text-center mt-1">
          Pause or end game to change settings
        </p>
      )}
    </div>
  );
};

export default React.memo(SettingsPanel);
