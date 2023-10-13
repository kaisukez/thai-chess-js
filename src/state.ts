import { BITS } from "./constants/Moving"

import { clone, swapColor } from "./utils"

import { Countdown, MoveObject, PieceCount, SquareData, State, toEnum } from "./types"
import { CountType, SquareIndex } from "./constants/Board"
import { Color, Piece } from "./constants/Piece"

export type ExtractInfoFromFenOutput = {
    boardString: string;
    activeColor: string;
    moveNumber: string;
    countColor?: string;
    countType?: string;
    count?: string;
    countFrom?: string;
    countTo?: string;
};

export function extractInfoFromFen(fen: string): ExtractInfoFromFenOutput {
    const length = fen.split(" ").length
    if (length !== 3 && length !== 8) {
        throw {
            code: "WRONG_NUMBER_OF_INPUTS",
            message: "fen must be string with 3 or 8 fields separated by space",
            field: "fen",
            fieldNumber: -1,
        }
    }

    const regex =
        /^(?<boardString>\S+)\s+(?<activeColor>\S+)\s+(?<moveNumber>\S+)(\s+(?<countColor>\S+)\s+(?<countType>\S+)\s+(?<count>\S+)\s+(?<countFrom>\S+)\s+(?<countTo>\S+))?$/
    const result = fen.trim().match(regex)

    if (!result) {
        throw {
            code: "WRONG_FEN_FORMAT",
            message: "wrong fen format",
            field: "fen",
            fieldNumber: -1,
        }
    }

    // return <ExtractInfoFromFenOutput> { ...result.groups }
    const parsed = { ...result.groups }
    const {
        boardString,
        activeColor,
        moveNumber,
        countColor,
        countType,
        count,
        countFrom,
        countTo,
    } = parsed

    /* ------------------------- boardString ------------------------- */
    if (/[^bfmterkBFMTERK1-8/]/.test(boardString)) {
        throw {
            code: "WRONG_BOARD_STRING_CHARACTER",
            message: `boardString can only contains 'bfmterkBFMTERK12345678/'`,
            field: "boardString",
            fieldNumber: 1, // start from 1 (not 0)
        }
    }

    if (!/^[bfmterkBFMTERK1-8]+(\/[bfmterkBFMTERK1-8]+){7}$/.test(boardString)) {
        throw {
            code: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
            message: `boardString must contain 8 ranks separated by '/'`,
            field: "boardString",
            fieldNumber: 1,
        }
    }

    if (/[1-8]{2,}/.test(boardString)) {
        throw {
            code: "WRONG_BOARD_STRING_NUMBER_NEXT_TO_EACH_OTHER",
            message:
                "boardString must not have any connected number like this /bb6/71/... (7 and 1)",
            field: "boardString",
            fieldNumber: 1,
        }
    }

    const squareCount = boardString
        .replace(/\//g, "")
        .split("")
        .reduce((count, character) => {
            if (/[1-8]/.test(character)) {
                return count + parseInt(character, 10)
            }
            return count + 1
        }, 0)
    if (squareCount !== 64) {
        throw {
            code: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
            message: "total of squares boardString represented must be 64",
            field: "boardString",
            fieldNumber: 1,
        }
    }

    let squaresPerRow = 0
    for (const row of boardString.split("/")) {
        squaresPerRow = 0
        for (const character of row) {
            if (/\d/.test(character)) {
                squaresPerRow += parseInt(character, 10)
            } else {
                squaresPerRow += 1
            }
        }
        if (squaresPerRow !== 8) {
            throw {
                code: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES_PER_RANK",
                message: "number of squares per rank must be 8",
                field: "boardString",
                fieldNumber: 1,
            }
        }
    }

    const [whiteKhunCount, blackKhunCount] = boardString
        .replace(/\//g, "")
        .split("")
        .reduce(
            (count, character) => {
                if (character === "K") {
                    return [count[0] + 1, count[1]]
                }
                if (character === "k") {
                    return [count[0], count[1] + 1]
                }
                return count
            },
            [0, 0],
        )
    if (whiteKhunCount !== 1 || blackKhunCount !== 1) {
        throw {
            code: "WRONG_BOARD_STRING_NUMBER_OF_KHUNS",
            message: "number of khun must be 1 for each side",
            field: "boardString",
            fieldNumber: 1,
        }
    }

    /* ------------------------- activeColor ------------------------- */
    if (activeColor !== Color.WHITE && activeColor !== Color.BLACK) {
        throw {
            code: "WRONG_ACTIVE_COLOR",
            message: `activeColor can be either 'w' or 'b' (white or black)`,
            field: "activeColor",
            fieldNumber: 2,
        }
    }

    /* ------------------------- moveNumber ------------------------- */
    if (!/^[1-9]\d*$/.test(moveNumber)) {
        throw {
            code: "WRONG_MOVE_NUMBER",
            message: "moveNumber must be number (positive number with no 0 in front)",
            field: "moveNumber",
            fieldNumber: 3,
        }
    }

    /* ------------------------- countdown ------------------------- */
    if (
        !(
            (countColor === "-" &&
                countType === "-" &&
                count === "-" &&
                countFrom === "-" &&
                countTo === "-") ||
            (countColor !== "-" &&
                countType !== "-" &&
                count !== "-" &&
                countFrom !== "-" &&
                countTo !== "-")
        )
    ) {
        throw {
            code: "WRONG_COUNTDOWN",
            message: `countColor, countType and count can be '-' at the same time or can be something else at the same time`,
            field: "countdown",
            fieldNumber: -1,
        }
    }

    if (countColor && countColor !== Color.WHITE && countColor !== Color.BLACK) {
        throw {
            code: "WRONG_COUNT_COLOR",
            message: `countColor can be either 'w' or 'b' (white or black)`,
            field: "countColor",
            fiendNumber: 4,
        }
    }

    if (countType && countType !== "bp" && countType !== "pp") {
        throw {
            code: "WRONG_COUNT_TYPE",
            message: `countType can be either 'bp' or 'pp' (board power or piece power)`,
            field: "countType",
            fieldNumber: 5,
        }
    }

    if (count && !/^[1-9]\d*$/.test(count)) {
        throw {
            code: "WRONG_COUNT_NUMBER",
            message:
                "countNumber must be number (positive number with no 0 in front)",
            field: "countNumber",
            fieldNumber: 6,
        }
    }

    if (countFrom && !/^[1-9]\d*$/.test(countFrom)) {
        throw {
            code: "WRONG_COUNT_FROM_NUMBER",
            message: "countFrom must be number (positive number with no 0 in front)",
            field: "countFrom",
            fieldNumber: 7,
        }
    }

    if (countTo && !/^[1-9]\d*$/.test(countTo)) {
        throw {
            code: "WRONG_COUNT_TO_NUMBER",
            message: "countTo must be number (positive number with no 0 in front)",
            field: "countTo",
            fieldNumber: 8,
        }
    }

    return <ExtractInfoFromFenOutput>parsed
}

export function getBoardStateFromBoardString(boardString: string) {
    const boardState = Array(128).fill(null)
    let i = 0
    for (const symbol of boardString.split("/").reverse().join("/")) {
        if (/[bfmterk]/.test(symbol)) {
            // boardState[i] = {
            //     color: BLACK,
            //     piece: symbol.toLowerCase()
            // }
            boardState[i] = [Color.BLACK, symbol.toLowerCase()]
            i++
        } else if (/[BFMTERK]/.test(symbol)) {
            // boardState[i] = {
            //     color: WHITE,
            //     piece: symbol.toLowerCase()
            // }
            boardState[i] = [Color.WHITE, symbol.toLowerCase()]
            i++
        } else if (/\d/.test(symbol)) {
            i += parseInt(symbol, 10)
        } else if (symbol === "/") {
            i += 8
        }
    }

    return boardState
}

export function forEachPieceFromBoardState(
    boardState: State["boardState"],
    func: (squareData: SquareData, squareIndex: SquareIndex) => void,
) {
    for (let i = SquareIndex.a1; i <= SquareIndex.h8; i++) {
        if (i & 0x88) {
            i += 7
            continue
        }

        const squareData = boardState[i]
        if (!squareData) {
            continue
        }

        func(squareData, i)
    }
}

export function getPiecePositions(
    boardState: State["boardState"],
): State["piecePositions"] {
    const piecePositions: State["piecePositions"] = {
        [Color.WHITE]: {
            [Piece.BIA]: [],
            [Piece.FLIPPED_BIA]: [],
            [Piece.MA]: [],
            [Piece.THON]: [],
            [Piece.MET]: [],
            [Piece.RUA]: [],
            [Piece.KHUN]: [],
        },
        [Color.BLACK]: {
            [Piece.BIA]: [],
            [Piece.FLIPPED_BIA]: [],
            [Piece.MA]: [],
            [Piece.THON]: [],
            [Piece.MET]: [],
            [Piece.RUA]: [],
            [Piece.KHUN]: [],
        },
    }

    forEachPieceFromBoardState(boardState, ([color, piece], squareIndex) => {
        piecePositions[color][piece] =
            piecePositions[color][piece].concat(squareIndex)
    })

    return piecePositions
}

export function forEachPiece(
    piecePositions: State["piecePositions"],
    func: (color: Color, piece: Piece, squareIndex: SquareIndex) => void,
) {
    for (const piece in piecePositions[Color.WHITE]) {
        for (const squareIndex of piecePositions[Color.WHITE][<Piece>piece]) {
            func(Color.WHITE, <Piece>piece, squareIndex)
        }
    }
    for (const piece in piecePositions[Color.BLACK]) {
        for (const squareIndex of piecePositions[Color.BLACK][<Piece>piece]) {
            func(Color.BLACK, <Piece>piece, squareIndex)
        }
    }
}

export function countPiece(
    piecePositions: State["piecePositions"],
): PieceCount {
    const pieceCount = {
        all: 0,

        color: {
            [Color.WHITE]: 0,
            [Color.BLACK]: 0,
        },
        piece: {
            [Piece.BIA]: 0,
            [Piece.FLIPPED_BIA]: 0,
            [Piece.MA]: 0,
            [Piece.THON]: 0,
            [Piece.MET]: 0,
            [Piece.RUA]: 0,
            [Piece.KHUN]: 0,
        },

        [Color.WHITE]: {
            [Piece.BIA]: 0,
            [Piece.FLIPPED_BIA]: 0,
            [Piece.MA]: 0,
            [Piece.THON]: 0,
            [Piece.MET]: 0,
            [Piece.RUA]: 0,
            [Piece.KHUN]: 0,
        },
        [Color.BLACK]: {
            [Piece.BIA]: 0,
            [Piece.FLIPPED_BIA]: 0,
            [Piece.MA]: 0,
            [Piece.THON]: 0,
            [Piece.MET]: 0,
            [Piece.RUA]: 0,
            [Piece.KHUN]: 0,
        },
    }

    forEachPiece(piecePositions, (color: Color, piece: Piece) => {
        pieceCount.all++
        pieceCount.color[color]++
        pieceCount.piece[piece]++
        pieceCount[color][piece]++
    })

    return pieceCount
}

/**
 * moveObject = { from: 21, to: 22 }
 * piecePositions = [5, 21, 49]
 *
 * updatePiecePositionDictionary(piecePositions, moveObject)
 * newPiecePosition = [5, 22, 49]
 */
export function updatePiecePositionDictionary(
    piecePositions: State["piecePositions"],
    moveObject: MoveObject,
) {
    const { color, piece, from, to, flags, promotion, captured } = moveObject

    if (
        !color ||
        !piece ||
        (!from && from !== 0) ||
        (!to && to !== 0) ||
        (flags & BITS.PROMOTION && !promotion) ||
        (flags & BITS.CAPTURE && !captured)
    ) {
        const requireMoreInput = []

        if (!color) {
            requireMoreInput.push("color")
        }
        if (!piece) {
            requireMoreInput.push("piece")
        }
        if (!from && from !== 0) {
            requireMoreInput.push("from")
        }
        if (!to && to !== 0) {
            requireMoreInput.push("to")
        }

        if (flags & BITS.PROMOTION && !promotion) {
            requireMoreInput.push("promotion")
        }

        if (flags & BITS.CAPTURE && !captured) {
            requireMoreInput.push("captured")
        }

        throw {
            code: "NOT_ENOUGH_INPUT",
            requireMoreInput: requireMoreInput,
        }
    }

    if (Array.isArray(piecePositions[color][piece])) {
        const index = piecePositions[color][piece].indexOf(from)
        if (index !== -1) {
            piecePositions[color][piece][index] = to
        }

        if (flags & BITS.PROMOTION && promotion) {
            const toDeleteIndex = piecePositions[color][piece].indexOf(to)
            if (toDeleteIndex !== -1) {
                piecePositions[color][piece].splice(toDeleteIndex, 1)
            }
            piecePositions[color][promotion].push(to)
        }

        if (flags & BITS.CAPTURE && captured) {
            const toDeleteIndex =
                piecePositions[swapColor(color)][captured].indexOf(to)
            if (toDeleteIndex !== -1) {
                piecePositions[swapColor(color)][captured].splice(toDeleteIndex, 1)
            }
        }
    }
}

// export function updatePiecePositionDictionary(
//     piecePositions: State["piecePositions"],
//     moveObject: MoveObject,
// ) {
//     const newPiecePositions = clone(piecePositions)
//     return updatePiecePositionDictionaryInplace(newPiecePositions, moveObject)
// }

export function createCountdownObject(
    countColor?: string,
    countType?: string,
    count?: string,
    countFrom?: string,
    countTo?: string,
): Countdown | null {
    if (countColor && countType && count && countFrom && countTo) {
        return {
            countColor: toEnum(Color, countColor),
            countType: toEnum(CountType, countType),
            count: parseInt(count, 10),
            countFrom: parseInt(countFrom, 10),
            countTo: parseInt(countTo, 10),
        }
    }

    return null
}

export function removePiecePositionIfExists(
    piecePositions: State["piecePositions"],
    boardState: State["boardState"],
    squareIndex: SquareIndex,
) {
    const squareData = boardState[squareIndex]
    if (squareData) {
        const [color, piece] = squareData
        const toDeleteIndex = piecePositions[color][piece].indexOf(squareIndex)
        if (toDeleteIndex !== -1) {
            piecePositions[color][piece].splice(toDeleteIndex, 1)
        }
    }
}

export function put(
    state: State,
    color: Color,
    piece: Piece,
    squareIndex: SquareIndex,
) {
    removePiecePositionIfExists(
        state.piecePositions,
        state.boardState,
        squareIndex,
    )

    state.boardState[squareIndex] = [color, piece]
    if (!state.piecePositions[color][piece].includes(squareIndex)) {
        state.piecePositions[color][piece].push(squareIndex)
    }
}

export function remove(state: State, squareIndex: SquareIndex) {
    removePiecePositionIfExists(
        state.piecePositions,
        state.boardState,
        squareIndex,
    )
    state.boardState[squareIndex] = null
}

export function importFen(fen: string): State {
    // throwIfWrongFen(fen)
    const fenInfo = extractInfoFromFen(fen)
    const boardState = getBoardStateFromBoardString(fenInfo.boardString)
    const piecePositions = getPiecePositions(boardState)
    const state: State = {
        activeColor: toEnum(Color, fenInfo.activeColor),
        moveNumber: parseInt(fenInfo.moveNumber, 10),
        boardState,
        // history: [],
        // future: [],
        piecePositions,
        countdown: createCountdownObject(
            fenInfo.countColor,
            fenInfo.countType,
            fenInfo.count,
            fenInfo.countFrom,
            fenInfo.countTo,
        ),
        countdownHistory: [],
        fenOccurrence: {},
    }
    state.fenOccurrence[fen] = 1
    return state
}

export function exportFen(state: State): string {
    const { boardState, activeColor, moveNumber } = state

    let empty = 0
    let fen = ""
    for (let i = SquareIndex.a1; i <= SquareIndex.h8; i++) {
        const squareData = boardState[i]
        if (!squareData) {
            empty++
        } else {
            if (empty > 0) {
                fen += empty
                empty = 0
            }

            const [color, piece] = squareData
            fen += color === Color.WHITE ? piece.toUpperCase() : piece.toLowerCase()
        }

        if ((i + 1) & 0x88) {
            if (empty > 0) {
                fen += empty
            }

            if (i !== SquareIndex.h8) {
                fen += "/"
            }

            empty = 0
            i += 8
        }
    }

    const result = [fen.split("/").reverse().join("/"), activeColor, moveNumber]

    if (state.countdown) {
        result.push(
            state.countdown.countColor,
            state.countdown.countType,
            state.countdown.count,
            state.countdown.countFrom,
            state.countdown.countTo,
        )
    }

    return result.join(" ")
}
