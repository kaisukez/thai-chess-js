import * as R from "ramda"

import { State } from "./types"
import { FILE_A, SquareIndex } from "./constants/Board"
import { Color } from "./constants/Piece"

// export function getSquareColor(square: SquareIndex) {
//     const _file = square & 1
//     const _rank = (square & 16) >> 4
//
//     const isWhite = _file ^ _rank
//
//     return isWhite ? Color.WHITE : Color.BLACK
// }

export const swapColor = R.cond([
    [R.equals(Color.WHITE), R.always(Color.BLACK)],
    [R.equals(Color.BLACK), R.always(Color.WHITE)],
])

export const getRank = (square: SquareIndex) => square >> 4

export const getFile = (square: SquareIndex) => square & 15

const getFileSymbols = R.ifElse(
    R.identity<boolean>,
    R.always<string>("กขคงจฉชญ"),
    R.always<string>("abcdefgh"),
)

const getRankSymbols = R.always("12345678")

const getFileSymbol = R.useWith(
    R.prop<number, string>,
    [
        getFile,
        getFileSymbols,
    ],
)

const getRankSymbol = R.useWith(
    R.prop<number, string>,
    [
        getRank,
        getRankSymbols,
    ],
)

export const getAlgebraic = (square: SquareIndex, isThai: boolean = false) => getFileSymbol(square, isThai) + getRankSymbol(square, isThai)

export function printBoard(boardState: State["boardState"]) {
    const isEnd = (iterator: number) => iterator === SquareIndex.h1

    let s = "     +------------------------+\n"
    let i = SquareIndex.a8

    if (!boardState) {
        throw { code: "NO_BOARD_STATE" }
    }

    while (true) {
        /* display the rank */
        if (getFile(i) === FILE_A) {
            // s += ' ' + (parseInt(rank(i), 10) + 1) + ' |'
            s += " " + (getRank(i) + 1) + " |"
        }

        /* empty piece */
        // if (boardState[i] == null || !(boardState[i].piece && boardState[i].color)) {
        const squareData = boardState[i]
        if (!squareData) {
            s += " . "
        } else {
            // const piece = squareData.piece
            // const color = squareData.color
            const [color, piece] = squareData
            const symbol = color === Color.WHITE ? piece.toUpperCase() : piece.toLowerCase()
            s += " " + symbol + " "
        }

        if ((i + 1) & 0x88) {
            s += "|\n"
            if (isEnd(i)) {
                break
            }
            i -= (SquareIndex.h8 - SquareIndex.a7)
        } else {
            i++
        }
    }
    s += "     +------------------------+\n"
    s += "     a  b  c  d  e  f  g  h\n"

    return s
}
