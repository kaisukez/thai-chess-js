import * as R from "ramda"
import { State } from "./types"
import { ATTACKS, Color, IS_SLIDING_PIECE, Piece, RAYS, SHIFTS, SquareIndex } from "./constants"
import { swapColor } from "./utils"
import { countPiece } from "./state"
import { generateLegalMoves } from "./move"

/**
 *
 * to find out if any of black piece can attack on e7 square
 *
 * canThisColorAttackThisSquare(BLACK, SQUARES.e7)
 *
 */
export function canThisColorAttackThisSquare(
    boardState: State["boardState"],
    color: Color,
    targetSquare: SquareIndex,
) {
    for (
        let fromIndex = SquareIndex.a1;
        fromIndex <= SquareIndex.h8;
        fromIndex++
    ) {
        /* did we run off the end of the board */
        if (fromIndex & 0x88) {
            fromIndex += 7
            continue
        }

        /* if empty square or wrong color */
        const squareData = boardState[fromIndex]
        if (!squareData || squareData[0] !== color) {
            continue
        }

        const fromSquare = squareData
        const lookUpIndex = fromIndex - targetSquare + 119

        if (ATTACKS[lookUpIndex] & (1 << SHIFTS[fromSquare[0]][fromSquare[1]])) {
            // if not sliding piece then return true
            if (!IS_SLIDING_PIECE[fromSquare[1]]) {
                return true
            }

            // if sliding piece then find out if it's blocked by other piece
            // if it's blocked then we can't attack, otherwise we can
            const offset = RAYS[lookUpIndex]
            let j = fromIndex + offset

            let blocked = false
            while (j !== targetSquare) {
                if (boardState[j]) {
                    blocked = true
                    break
                }
                j += offset
            }

            if (!blocked) {
                return true
            }
        }
    }

    return false
}

export const isKhunAttacked = (state: State, color: Color) =>
    canThisColorAttackThisSquare(
        R.prop("boardState", state),
        swapColor(color),
        R.path(["piecePositions", color, Piece.KHUN, 0], state),
    )

export const inCheck = R.converge(isKhunAttacked, [R.identity, R.prop("activeColor")])

export const inCheckmate = R.both(
    inCheck,
    R.pipe(generateLegalMoves, R.isEmpty),
)

export const inStalemate = R.both(
    R.complement(inCheck),
    R.pipe(generateLegalMoves, R.isEmpty),
)

export const inThreefoldRepetition = (state: State): boolean => {
    const occurrences = R.prop("fenOccurrence", state)
    return R.any(R.gte(R.__, 3), R.values(occurrences))
}

export const inDraw = R.anyPass([
    inStalemate,
    isFinishedCounting,
    insufficientMaterial,
    inThreefoldRepetition,
])

export const isGameOver = R.either(inDraw, inCheckmate)

export function insufficientMaterial(state: State): boolean {
    const pieceCount = countPiece(state.piecePositions)

    // came from answer in facebook group from the question I asked
    return (
        pieceCount.all === 2 ||
        (pieceCount.all === 3 &&
            (pieceCount.piece[Piece.BIA] === 1 ||
                pieceCount.piece[Piece.FLIPPED_BIA] === 1 ||
                pieceCount.piece[Piece.MET] === 1 ||
                pieceCount.piece[Piece.MA] === 1))
    )
}

export function isFinishedCounting(state: State) {
    const { countdown, activeColor } = state

    return Boolean(
        countdown &&
        countdown.countColor === activeColor &&
        countdown.count >= countdown.countTo,
    )
}
