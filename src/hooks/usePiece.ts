import { useState, useCallback, useRef, useEffect } from "react";
import { Board, Tetromino, TetrominoType } from "@/types";
import {
    generateNewPiece,
    generateBag,
    isValidMove,
    getGhostPiecePosition,
    getWallKicks,
} from "@/lib/utils";
import { PREVIEW_PIECES } from "@/lib/constants";

export function usePiece(board: Board) {
    const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
    const [nextPieces, setNextPieces] = useState<TetrominoType[]>([]);
    const [heldPiece, setHeldPiece] = useState<TetrominoType | null>(null);
    const [canHold, setCanHold] = useState(true);
    const [ghostPiece, setGhostPiece] = useState<Tetromino | null>(null);
    const bagRef = useRef<TetrominoType[]>([]);

    // Initialize bag if empty
    const ensureBag = useCallback(() => {
        if (bagRef.current.length === 0) {
            bagRef.current = generateBag();
        }
        if (bagRef.current.length < PREVIEW_PIECES + 1) {
            bagRef.current.push(...generateBag());
        }
    }, []);

    const getNextPieceType = useCallback((): TetrominoType => {
        ensureBag();
        const next = bagRef.current.shift() as TetrominoType;
        ensureBag();
        setNextPieces(bagRef.current.slice(0, PREVIEW_PIECES));
        return next;
    }, [ensureBag]);

    const spawnNewPiece = useCallback(() => {
        const nextType = getNextPieceType();
        const newPiece = generateNewPiece(nextType);
        setCurrentPiece(newPiece);
        setCanHold(true);
        return newPiece;
    }, [getNextPieceType]);

    const resetPieces = useCallback(() => {
        bagRef.current = [];
        ensureBag();
        setNextPieces(bagRef.current.slice(0, PREVIEW_PIECES));
        setHeldPiece(null);
        setCanHold(true);
        return spawnNewPiece();
    }, [ensureBag, spawnNewPiece]);

    // Update ghost piece whenever current piece or board changes
    useEffect(() => {
        if (currentPiece) {
            setGhostPiece(getGhostPiecePosition(currentPiece, board));
        } else {
            setGhostPiece(null);
        }
    }, [currentPiece, board]);

    const move = useCallback(
        (dx: number, dy: number) => {
            if (!currentPiece) return false;

            const newPosition = {
                x: currentPiece.position.x + dx,
                y: currentPiece.position.y + dy,
            };

            const movedPiece = { ...currentPiece, position: newPosition };

            if (isValidMove(movedPiece, board)) {
                setCurrentPiece(movedPiece);
                return true;
            }
            return false;
        },
        [currentPiece, board]
    );

    const rotate = useCallback(() => {
        if (!currentPiece) return;

        const newRotation = (currentPiece.rotation + 1) % 4;
        const rotatedPiece = {
            ...currentPiece,
            rotation: newRotation,
        };

        const kicks = getWallKicks(currentPiece, currentPiece.rotation);

        for (const kick of kicks) {
            const kickedPiece = {
                ...rotatedPiece,
                position: {
                    x: rotatedPiece.position.x + kick.x,
                    y: rotatedPiece.position.y + kick.y,
                },
            };

            if (isValidMove(kickedPiece, board)) {
                setCurrentPiece(kickedPiece);
                return;
            }
        }
    }, [currentPiece, board]);

    const hold = useCallback(() => {
        if (!currentPiece || !canHold) return;

        const pieceToHold = currentPiece.type;
        let newCurrentPiece;

        if (heldPiece) {
            newCurrentPiece = generateNewPiece(heldPiece);
        } else {
            newCurrentPiece = generateNewPiece(getNextPieceType());
        }

        setHeldPiece(pieceToHold);
        setCurrentPiece(newCurrentPiece);
        setCanHold(false);
    }, [currentPiece, canHold, heldPiece, getNextPieceType]);

    return {
        currentPiece,
        setCurrentPiece,
        nextPieces,
        heldPiece,
        canHold,
        ghostPiece,
        move,
        rotate,
        hold,
        spawnNewPiece,
        resetPieces,
    };
}
