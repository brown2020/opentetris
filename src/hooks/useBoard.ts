import { useState, useCallback } from "react";
import { Board, Tetromino } from "@/types";
import { createEmptyBoard, addPieceToBoard, clearLines } from "@/lib/utils";

export function useBoard() {
    const [board, setBoard] = useState<Board>(createEmptyBoard());

    const resetBoard = useCallback(() => {
        setBoard(createEmptyBoard());
    }, []);

    const lockPiece = useCallback((piece: Tetromino) => {
        const newBoard = addPieceToBoard(board, piece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        setBoard(clearedBoard);
        return { linesCleared, newBoard: clearedBoard };
    }, [board]);

    return {
        board,
        setBoard,
        resetBoard,
        lockPiece,
    };
}
