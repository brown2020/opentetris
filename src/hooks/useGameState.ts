import { useState, useCallback } from "react";
import { GameState } from "@/types";
import {
    calculateScore,
    calculateLevel,
    calculateSpeed,
} from "@/lib/utils";
import { INITIAL_SPEED } from "@/lib/constants";

export function useGameState() {
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lines, setLines] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameState, setGameState] = useState<GameState>("INITIAL");
    const [dropSpeed, setDropSpeed] = useState(INITIAL_SPEED);

    const resetGameState = useCallback(() => {
        setScore(0);
        setLevel(1);
        setLines(0);
        setGameState("PLAYING");
        setDropSpeed(INITIAL_SPEED);
    }, []);

    const addScore = useCallback((points: number) => {
        setScore((prev) => prev + points);
    }, []);

    const addLines = useCallback(
        (linesCleared: number) => {
            if (linesCleared > 0) {
                const points = calculateScore(linesCleared, level);
                setScore((prev) => prev + points);
                setLines((prev) => {
                    const newLines = prev + linesCleared;
                    const newLevel = calculateLevel(newLines);
                    if (newLevel !== level) {
                        setLevel(newLevel);
                        setDropSpeed(calculateSpeed(newLevel));
                    }
                    return newLines;
                });
            }
        },
        [level]
    );

    const updateHighScore = useCallback(() => {
        setHighScore((prev) => Math.max(prev, score));
    }, [score]);

    const setGameOver = useCallback(() => {
        setGameState("GAME_OVER");
        updateHighScore();
    }, [updateHighScore]);

    const togglePause = useCallback(() => {
        setGameState((prev) => (prev === "PLAYING" ? "PAUSED" : "PLAYING"));
    }, []);

    return {
        score,
        level,
        lines,
        highScore,
        gameState,
        dropSpeed,
        setGameState,
        resetGameState,
        addScore,
        addLines,
        setGameOver,
        togglePause,
    };
}
