import * as R from "ramda"

import { ATTACK_OFFSETS, ATTACKS, BITS, IS_SLIDING_PIECE, MOVE_OFFSETS, RAYS } from "./constants/Moving"

import { getAlgebraic, getFile, getRank, swapColor } from "./utils"

import { countPiece, exportFen, updatePiecePositionDictionary } from "./state"

import { Countdown, Move, MoveObject, State } from "./types"
import { CountType, RANK_3, RANK_6, SquareIndex } from "./constants/Board"
import { Color, Piece, SHIFTS } from "./constants/Piece"

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
    R.pipe(isFinishedCounting, Boolean),
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

    return (
        countdown &&
        countdown.countColor === activeColor &&
        countdown.count >= countdown.countTo
    )
}

export function calculatePiecePowerCountdown(state: State) {
    const pieceCount = countPiece(state.piecePositions)

    // to activate piece power countdown
    // one must only have Khun left and there must be no Bia left on the board
    if (
        pieceCount.color[state.activeColor] !== 1 ||
        pieceCount.piece[Piece.BIA] !== 0
    ) {
        return null
    }

    const opponentPieceCount = pieceCount[swapColor(state.activeColor)]
    if (opponentPieceCount[Piece.RUA] in [1, 2]) {
        return {
            countFrom: 1,
            countTo: 16 / opponentPieceCount[Piece.RUA],
        }
    }

    if (opponentPieceCount[Piece.THON] in [1, 2]) {
        return {
            countFrom: 1,
            countTo: 44 / opponentPieceCount[Piece.THON],
        }
    }

    if (opponentPieceCount[Piece.MA] in [1, 2]) {
        return {
            countFrom: 1,
            countTo: 64 / opponentPieceCount[Piece.MA],
        }
    }

    return {
        countFrom: 1,
        countTo: 64,
    }
}

export function calculateBoardPowerCountdown(state: State) {
    const pieceCount = countPiece(state.piecePositions)

    // to activate board power countdown
    // one must have more than 1 piece (including Khun)
    // and there must be no Bia left on the board
    if (
        pieceCount.color[state.activeColor] === 1 ||
        pieceCount.piece[Piece.BIA] !== 0
    ) {
        return null
    }

    return {
        countFrom: pieceCount.all,
        countTo: 64,
    }
}

export function calculateCountdown(state: State): Countdown | null {
    const piecePowerCountdown = calculatePiecePowerCountdown(state)
    const boardPowerCountdown = calculateBoardPowerCountdown(state)

    if (piecePowerCountdown) {
        return {
            // fromMove: state.moveNumber,
            countColor: state.activeColor, // which side want to count
            countType: CountType.PIECE_POWER_COUNTDOWN, // count type
            count: piecePowerCountdown.countFrom, // current count
            ...piecePowerCountdown,
        }
    }

    if (boardPowerCountdown) {
        return {
            // fromMove: state.moveNumber,
            countColor: state.activeColor,
            countType: CountType.BOARD_POWER_COUNTDOWN,
            count: boardPowerCountdown.countFrom,
            ...boardPowerCountdown,
        }
    }

    return null
}

/**
 *
 * @param {Object} boardState
 * @param {Number} from 0x88 square
 * @param {Number} to 0x88 square
 *
 */
export function changePiecePosition(
    boardState: State["boardState"],
    from: SquareIndex,
    to: SquareIndex,
) {
    if (!from && !to) {
        return
    }

    boardState[to] = boardState[from]
    boardState[from] = null
}

/**
 * Increase move counter (if black have made a move) and swap color
 *
 * @param {Object} state
 *
 */
export function step(state: State) {
    if (state.activeColor === Color.BLACK) {
        state.moveNumber++
    }

    state.activeColor = swapColor(state.activeColor)
}

// export function stepBackInplace(state: State) {
//     if (state.activeColor === Color.WHITE) {
//         state.moveNumber--
//     }
//
//     state.activeColor = swapColor(state.activeColor)
//
//     return state
// }

// export function stepBack(state: State) {
//     const newState = clone(state)
//     return stepBackInplace(newState)
// }

export type CountdownFlag = {
    startPiecePowerCountdown?: boolean;
    startBoardPowerCountdown?: boolean;
    startCountdown?: boolean;
    stopPiecePowerCountdown?: boolean;
    stopBoardPowerCountdown?: boolean;
    stopCountdown?: boolean;
};

export function hasStartCountdownFlag(flags: CountdownFlag = {}) {
    return (
        flags.startPiecePowerCountdown ||
        flags.startBoardPowerCountdown ||
        flags.startCountdown
    )
}

export function hasStopCountdownFlag(flags: CountdownFlag = {}) {
    return (
        flags.stopPiecePowerCountdown ||
        flags.stopBoardPowerCountdown ||
        flags.stopCountdown
    )
}

export function hasCountdownFlag(flags: CountdownFlag = {}) {
    return hasStartCountdownFlag(flags) || hasStopCountdownFlag(flags)
}

export type StepCountdownFlags = {
    startPiecePowerCountdown?: boolean;
    startBoardPowerCountdown?: boolean;
    startCountdown?: boolean;

    stopPiecePowerCountdown?: boolean;
    stopBoardPowerCountdown?: boolean;
    stopCountdown?: boolean;
};

export function stepCountdown(state: State, flags: StepCountdownFlags = {}) {
    const {
        startPiecePowerCountdown,
        startBoardPowerCountdown,
        startCountdown,

        stopPiecePowerCountdown,
        stopBoardPowerCountdown,
        stopCountdown,
    } = flags

    // if there's no countdown flag then return the same state
    // if (!anyCountdownFlag(flags)) {
    //     return state
    // }

    // if we didn't count yet but you give coundown flag then throw error
    if (!state.countdown && hasStopCountdownFlag(flags)) {
        throw { code: "CANNOT_STOP_UNCOUNTED_STATE" }
    }

    // if we already count but you give coundown flag again then throw error
    if (state.countdown && hasStartCountdownFlag(flags)) {
        throw { code: "CANNOT_START_ALREADY_COUNTED_STATE" }
    }

    const countdown = calculateCountdown(state)

    // if there's no countdown then return the same state (TODO: check if this statement is valid)
    if (!countdown) {
        return state
    }

    // if we didn't count yet and we give countdown flag
    // then start counting if countdown flag is valid
    if (!state.countdown) {
        if (
            (startPiecePowerCountdown &&
                countdown.countType === CountType.PIECE_POWER_COUNTDOWN) ||
            (startBoardPowerCountdown &&
                countdown.countType === CountType.BOARD_POWER_COUNTDOWN) ||
            startCountdown
        ) {
            state.countdown = countdown
        } else if (hasStartCountdownFlag(flags)) {
            // console.log(flags, state.countdown)
            throw { code: "WRONG_COUNTDOWN_TYPE" }
        }
    }

    // if we alrealdy count
    else {
        // if we give stop countdown flag
        if (hasStopCountdownFlag(flags)) {
            if (
                (stopPiecePowerCountdown &&
                    state.countdown.countType === CountType.PIECE_POWER_COUNTDOWN) ||
                (stopBoardPowerCountdown &&
                    state.countdown.countType === CountType.BOARD_POWER_COUNTDOWN) ||
                stopCountdown
            ) {
                // state.countdownHistory.push(state.countdown)
                state.countdown = null
            } else {
                throw { code: "WRONG_STOP_COUNTDOWN_FLAG" }
            }
        }

        // continue counting the same type
        else if (
            state.countdown.countType === countdown.countType &&
            state.activeColor === state.countdown.countColor
        ) {
            state.countdown.count++
        }

            // continue counting different type only if we change from
        // board power countdown to piece power countdown
        else if (
            state.countdown.countType === CountType.BOARD_POWER_COUNTDOWN &&
            countdown.countType === CountType.PIECE_POWER_COUNTDOWN
        ) {
            state.countdown = countdown
        }
    }
}

// export function stepBackCountdown(state: State) {
//     const newState = clone(state)
//
//     const { countdown, activeColor } = newState
//
//     if (countdown && countdown.countColor === activeColor) {
//         const { count, countFrom } = countdown
//         if (count > countFrom) {
//             countdown.count--
//         } else {
//             newState.countdown = null
//         }
//     }
//
//     return newState
// }

export function makeMove(
    state: State,
    moveObject: MoveObject,
    optional = {},
    keepFuture = false,
) {
    changePiecePosition(
        state.boardState,
        moveObject.from,
        moveObject.to,
    )

    stepCountdown(state, optional)

    if (moveObject.flags & BITS.PROMOTION && moveObject.promotion) {
        state.boardState[moveObject.to]![1] = moveObject.promotion
    }

    step(state)

    // update position lookup table
    // state.piecePositions = updatePiecePositionDictionary(
    //     state.piecePositions,
    //     moveObject
    // )
    updatePiecePositionDictionary(
        state.piecePositions,
        moveObject,
    )

    // state.history.push({ ...moveObject, optional })
    // if (!keepFuture) {
    //     state.future = []
    // }

    const fen = exportFen(state)

    state.fenOccurrence[fen] = state.fenOccurrence[fen] ? state.fenOccurrence[fen] + 1 : 1
}

// export function nextMove(state: State) {
//     if (!state.future || (state.future && state.future.length === 0)) {
//         throw { code: "NO_FUTURE_MOVE" }
//     }
//
//     let newState = clone(state)
//     if (!newState.future) {
//         throw { code: "NO_FUTURE_MOVE" }
//     }
//     const nextMove = newState.future.shift()! // it's not undefined because we've check length of the future earlier
//     makeMove(newState, nextMove, nextMove.optional, true)
// }

// export function undoMove(state: State) {
//     if (!state.history || (state.history && state.history.length === 0)) {
//         throw { code: "NO_MOVE_HISTORY" }
//     }
//
//     let newState = clone(state)
//     newState = stepBack(newState)
//     newState = stepBackCountdown(newState)
//     if (!newState.history || !newState.future) {
//         throw { code: "NO_MOVE_HISTORY" }
//     }
//     const lastMove = newState.history.pop()! // it's not undefined because we've check length of the history earlier
//     newState.future.unshift(lastMove)
//
//     const { piece, from, to, flags, captured } = lastMove
//     const { boardState, activeColor } = newState
//     boardState[from] = boardState[to]
//     // boardState[from].type = piece // undo promotion
//     boardState[from]![1] = piece // undo promotion
//     boardState[to] = null
//
//     if (flags & BITS.CAPTURE && captured) {
//         // boardState[to] = { piece: captured, color: swapColor(activeColor) }
//         boardState[to] = [swapColor(activeColor), captured]
//     }
//
//     return newState
// }

export type GenerateMovesForOneSquareOptions = {
    forColor?: Color;
    legal?: boolean;
};

export function generateMovesForOneSquare(
    state: State,
    squareIndex: SquareIndex,
    options: GenerateMovesForOneSquareOptions = {},
): MoveObject[] {
    const { boardState } = state
    const moves: MoveObject[] = []

    // if the square is off the board
    if (squareIndex & 0x88) {
        return moves
    }

    const squareData = boardState[squareIndex]

    // if the square is empty
    if (!squareData) {
        return moves
    }

    const { forColor, legal } = options
    const [color, piece] = squareData

    let squarePointer = squareIndex

    if (forColor && forColor !== color) {
        return moves
    }

    const attackOffsets = ATTACK_OFFSETS[color][piece]
    for (const offset of attackOffsets) {
        squarePointer = squareIndex
        while (true) {
            squarePointer += offset
            const targetSquare = boardState[squarePointer]

            // if the square is off the board
            if (squarePointer & 0x88) {
                break
            }

            // if it's a opponent piece
            if (targetSquare) {
                if (targetSquare[0] !== color) {
                    const move: MoveObject = {
                        color,
                        piece,
                        from: squareIndex,
                        to: squarePointer,
                        flags: BITS.CAPTURE,
                        captured: targetSquare[1],
                    }
                    if (
                        piece === Piece.BIA &&
                        (getRank(squarePointer) === RANK_3 || getRank(squarePointer) === RANK_6)
                    ) {
                        move.promotion = Piece.FLIPPED_BIA
                        move.flags |= BITS.PROMOTION
                    }
                    moves.push(move)
                }
                break
            }

            if (!IS_SLIDING_PIECE[piece]) {
                break
            }
        }
    }

    const moveOffsets = MOVE_OFFSETS[color][piece]
    for (const offset of moveOffsets) {
        squarePointer = squareIndex
        while (true) {
            squarePointer += offset
            const targetSquare = boardState[squarePointer]

            // if the square is off the board
            if (squarePointer & 0x88) {
                break
            }

            // if it's a empty square
            if (!targetSquare) {
                const move: MoveObject = {
                    color,
                    piece,
                    from: squareIndex,
                    to: squarePointer,
                    flags: BITS.NORMAL,
                }
                if (
                    piece === Piece.BIA &&
                    (getRank(squarePointer) === RANK_3 || getRank(squarePointer) === RANK_6)
                ) {
                    move.promotion = Piece.FLIPPED_BIA
                    move.flags |= BITS.PROMOTION
                }
                moves.push(move)
            } else {
                break
            }

            if (!IS_SLIDING_PIECE[piece]) {
                break
            }
        }
    }

    if (!legal) {
        return moves
    }

    const legalMoves = []
    for (const move of moves) {
        const newState = R.clone(state)
        makeMove(newState, move)
        if (!isKhunAttacked(newState, swapColor(newState.activeColor))) {
            legalMoves.push(move)
        }
    }

    return legalMoves
}

export function generateMoves(
    state: State,
    options: GenerateMovesForOneSquareOptions,
): MoveObject[] {
    const moves: MoveObject[] = []
    state.boardState.forEach((_, index) => {
        moves.push(...generateMovesForOneSquare(state, index, options))
    })
    return moves
}

export function generateLegalMoves(state: State) {
    return generateMoves(state, {
        forColor: state.activeColor,
        legal: true,
    })
}

const sanRegex =
    /^(?<piece>[FEMTRK])?(?<fromFlie>[a-h]|[\u0E01\u0E02\u0E04\u0E07\u0E08\u0E09\u0E0A\u0E0D])?(?<fromRank>[1-8])?(?<capture>[x:])?(?<to>[a-h]|[\u0E01\u0E02\u0E04\u0E07\u0E08\u0E09\u0E0A\u0E0D][1-8])(?<promotion>=(?<promoteTo>[F]))?(?<check>(?<normalCheck>[+†])|(?<doubleCheck>\+{2}|‡))?(?<checkmate>[#≠])?$/

/* this export function is used to uniquely identify ambiguous moves */
export function getDisambiguator(
    possibleMoves: MoveObject[],
    move: MoveObject,
) {
    const { from, to, piece } = move

    const samePieceAndDestinationMoves = possibleMoves.filter(
        (move) => move.piece === piece && move.to === to && move.from !== from,
    )

    let sameRank = 0
    let sameFile = 0
    samePieceAndDestinationMoves.forEach((move) => {
        if (getRank(move.from) === getRank(from)) {
            sameRank++
        }

        if (getFile(move.from) === getFile(from)) {
            sameFile++
        }
    })

    /* if there exists a similar moving piece on the same rank and file as
     * the move in question, use the square as the disambiguator
     */
    if (sameRank > 0 && sameFile > 0) {
        return getAlgebraic(from)
    } else if (sameFile > 0) {
        /* if the moving piece rests on the same file, use the rank symbol as the
         * disambiguator
         */
        return getAlgebraic(from).charAt(1)
    } else if (sameRank > 0) {
        /* else use the file symbol */
        return getAlgebraic(from).charAt(0)
    }

    return ""
}

/* convert a move from 0x88 coordinates to Standard Algebraic Notation
 * (SAN)
 *
 * @param {boolean} sloppy Use the sloppy SAN generator to work around over
 * disambiguation bugs in Fritz and Chessbase.    See below:
 *
 * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
 * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
 * 4. ... Ne7 is technically the valid SAN
 */
export function moveToSan(state: State, move: MoveObject) {
    const possibleMoves = generateLegalMoves(state)
    const disambiguator = getDisambiguator(possibleMoves, move)

    let output = ""

    if (move.piece !== Piece.BIA) {
        output += move.piece.toUpperCase() + disambiguator
    }

    if (move.flags & BITS.CAPTURE) {
        if (move.piece === Piece.BIA) {
            output += getAlgebraic(move.from)[0]
        }
        output += "x"
    }

    output += getAlgebraic(move.to)

    if (move.flags & BITS.PROMOTION && move.promotion) {
        output += "=" + move.promotion.toUpperCase()
    }

    const newState = R.clone(state)
    makeMove(newState, move)
    if (inCheck(newState)) {
        if (inCheckmate(newState)) {
            output += "#"
        } else {
            output += "+"
        }
    }

    return output
}

export function strippedSan(san: string) {
    return san.replace(
        /[^FEMTRKa-h\u0E01\u0E02\u0E04\u0E07\u0E08\u0E09\u0E0A\u0E0D1-8]/g,
        "",
    )
}

export function moveFromSan(state: State, san: string) {
    const possibleMoves = generateLegalMoves(state)
    // console.log(possibleMoves)

    // strip off any move decorations: e.g Nf3+?!
    const cleanMove = strippedSan(san)

    let result
    for (const move of possibleMoves) {
        if (cleanMove === strippedSan(moveToSan(state, move))) {
            result = move
        }
    }

    return result
}

export function moveFromMoveObject(state: State, moveObject: MoveObject) {
    const possibleMoves = generateLegalMoves(state)
    // console.log(possibleMoves)

    let result
    for (const move of possibleMoves) {
        let from, to

        if (typeof moveObject.from === "number") {
            from = move.from
            to = move.to
        } else if (moveObject.from === "string") {
            from = getAlgebraic(move.from)
            to = getAlgebraic(move.to)
        }

        if (moveObject.from === from && moveObject.to === to) {
            result = move
        }
    }

    return result
}

/**
 *
 * @param {Object} state
 * @param {String | Object} move SAN or moveObject
 *
 * moveObject = {
 *     from: Number, algebraic position like e4 d7 ...
 *     to: Number, algebraic position like e4 d7 ...
 * }
 *
 * @param optional
 */
export function move(state: State, move: Move, optional = {}) {
    let moveObject
    if (typeof move === "string") {
        moveObject = moveFromSan(state, move)
    } else if (typeof move === "object") {
        moveObject = moveFromMoveObject(state, move)
    }

    if (!moveObject) {
        throw { code: "INVALID_MOVE" }
    }

    makeMove(state, moveObject, optional)
}
