import * as R from "ramda"

import { State } from "./types"
import { FILE_A, SquareIndex } from "./constants/Board"
import { Color } from "./constants/Piece"


export const swapColor = R.cond([
    [R.equals(Color.WHITE), R.always(Color.BLACK)],
    [R.equals(Color.BLACK), R.always(Color.WHITE)],
])

export function rank(square: SquareIndex) {
    return square >> 4
}

export function file(square: SquareIndex) {
    return square & 15
}

export function squareColor(square: SquareIndex) {
    const _file = square & 1
    const _rank = (square & 16) >> 4

    const isWhite = _file ^ _rank

    return isWhite ? Color.WHITE : Color.BLACK
}

export type AlgebraicOptions = {
    thai?: boolean
}

export function algebraic(square: SquareIndex, optional: AlgebraicOptions = {}) {
    const { thai } = optional

    const _file = file(square)
    const _rank = rank(square)

    let fileSymbols = "abcdefgh"
    let rankSymbols = "12345678"
    if (thai) {
        fileSymbols = "กขคงจฉชญ"
    }

    return fileSymbols[_file] + rankSymbols[_rank]
}

export function ascii(boardState: State["boardState"]) {
    const end = (iterator: number) => iterator === SquareIndex.h1

    let s = "     +------------------------+\n"
    let i = SquareIndex.a8

    if (!boardState) {
        throw { code: "NO_BOARD_STATE" }
    }

    while (true) {
        /* display the rank */
        if (file(i) === FILE_A) {
            // s += ' ' + (parseInt(rank(i), 10) + 1) + ' |'
            s += " " + (rank(i) + 1) + " |"
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
            if (end(i)) {
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

// https://stackoverflow.com/a/728694/10154216
export function clone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
        return obj
    }

    if (Array.isArray(obj)) {
        const copyArray: any[] = []
        for (let i = 0, len = (obj as any[]).length; i < len; i++) {
            copyArray[i] = clone((obj as any[])[i])
        }
        return copyArray as unknown as T
    }

    if (obj instanceof Object) {
        const copyObj: { [key: string]: any } = {}
        for (const attr in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                copyObj[attr] = clone((obj as { [key: string]: any })[attr])
            }
        }
        return copyObj as T
    }

    throw { code: "OBJECT_TYPE_IS_NOT_SUPPORTED" }
}

// https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
// export function clone<T extends Object>(obj: T): T {
//     return structuredClone(obj)
// }

// https://gist.github.com/JamieMason/172460a36a0eaef24233e6edb2706f83
export const compose = (...fns: Function[]) =>
    (...args: any) => fns.reduceRight(
        (params, f) => Array.isArray(params) ? f(...params) : f(params),
        args,
    )

export const pipe = (...fns: Function[]) =>
    (...args: any) => fns.reduce(
        (params, f) => Array.isArray(params) ? f(...params) : f(params),
        args,
    )
