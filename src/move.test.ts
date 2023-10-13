import { importFen, put } from "./state"

import { move } from "./move"
import { Color, EMPTY_FEN, Piece, SquareIndex } from "./constants"
import { canThisColorAttackThisSquare } from "./gameStatus"

const { WHITE, BLACK } = Color
const { BIA, FLIPPED_BIA, MA, THON, MET, RUA, KHUN } = Piece

// @formatter:off
const {
    a8, b8, c8, d8, e8, f8, g8, h8,
    a7, b7, c7, d7, e7, f7, g7, h7,
    a6, b6, c6, d6, e6, f6, g6, h6,
    a5, b5, c5, d5, e5, f5, g5, h5,
    a4, b4, c4, d4, e4, f4, g4, h4,
    a3, b3, c3, d3, e3, f3, g3, h3,
    a2, b2, c2, d2, e2, f2, g2, h2,
    a1, b1, c1, d1, e1, f1, g1, h1
} = SquareIndex
// @formatter:on

describe("move", () => {
    describe("canTh,isColorAttackThisSquare", () => {
        // TODO
        const setup = () => {
            const state = importFen(EMPTY_FEN)
            put(state, WHITE, BIA, c5)
            return { state }
        }

        const tests = [
            {
                color: WHITE,
                piece: BIA,
                square: f5,
                canAttack: [e6, g6],
                cannotAttack: [f5, f6, e4, g4],
            },
            {
                color: BLACK,
                piece: BIA,
                square: f5,
                canAttack: [e4, g4],
                cannotAttack: [f5, f4, e6, g6],
            },
            {
                color: WHITE,
                piece: THON,
                square: f5,
                canAttack: [e6, f6, g6, e4, g4],
                cannotAttack: [e5, g5, f4],
            },
            {
                color: BLACK,
                piece: THON,
                square: f5,
                canAttack: [e4, f4, g4, e6, g6],
                cannotAttack: [e5, g5, f6],
            },

            {
                color: WHITE,
                piece: FLIPPED_BIA,
                square: f5,
                canAttack: [e6, g6, e4, g4],
                cannotAttack: [f6, e5, g5, f4],
            },
            {
                color: BLACK,
                piece: FLIPPED_BIA,
                square: f5,
                canAttack: [e6, g6, e4, g4],
                cannotAttack: [f6, e5, g5, f4],
            },
            {
                color: WHITE,
                piece: MET,
                square: f5,
                canAttack: [e6, g6, e4, g4],
                cannotAttack: [f6, e5, g5, f4],
            },
            {
                color: BLACK,
                piece: MET,
                square: f5,
                canAttack: [e6, g6, e4, g4],
                cannotAttack: [f6, e5, g5, f4],
            },

            {
                color: WHITE,
                piece: MA,
                square: f5,
                canAttack: [e7, g7, d6, h6, d4, h4, e3, g3],
                cannotAttack: [d7, f7, h7, e6, f6, g6, d5, e5, g5, h5, e4, f4, g4, d3, f3, h3],
            },
            {
                color: BLACK,
                piece: MA,
                square: f5,
                canAttack: [e7, g7, d6, h6, d4, h4, e3, g3],
                cannotAttack: [d7, f7, h7, e6, f6, g6, d5, e5, g5, h5, e4, f4, g4, d3, f3, h3],
            },

            {
                color: WHITE,
                piece: KHUN,
                square: f5,
                canAttack: [e6, f6, g6, e5, g5, e4, f4, g4],
                cannotAttack: [],
            },
            {
                color: BLACK,
                piece: KHUN,
                square: f5,
                canAttack: [e6, f6, g6, e5, g5, e4, f4, g4],
                cannotAttack: [],
            },

            {
                color: WHITE,
                piece: RUA,
                square: e4,
                canAttack: [e5, e6, e7, e8, f4, g4, h4, e3, e2, e1, d4, c4, b4, a4],
                cannotAttack: [],
            },
            {
                color: BLACK,
                piece: RUA,
                square: e4,
                canAttack: [e5, e6, e7, e8, f4, g4, h4, e3, e2, e1, d4, c4, b4, a4],
                cannotAttack: [],
            },
            {
                color: WHITE,
                piece: RUA,
                square: f5,
                canAttack: [f6, f7, f8, g5, h5, f4, f3, f2, f1, e5, d5, c5],
                cannotAttack: [b5, a5],
            },
            {
                color: BLACK,
                piece: RUA,
                square: f5,
                canAttack: [f6, f7, f8, g5, h5, f4, f3, f2, f1, e5, d5, c5],
                cannotAttack: [b5, a5],
            },
        ]

        test("can perform correctly", () => {
            for (const test of tests) {
                const {
                    color,
                    piece,
                    square,
                    canAttack,
                    cannotAttack,
                } = test

                const { state } = setup()
                put(state, color, piece, square)

                // const newState = pipe(
                //     put(state, color, piece, square),
                //     state => state
                // )(state)

                for (const square of canAttack) {
                    const result = canThisColorAttackThisSquare(state.boardState, color, square)
                    if (!result) {
                        console.log("this test didn't pass", test)
                    }
                    expect(result).toBe(true)
                }
                for (const square of cannotAttack) {
                    const result = canThisColorAttackThisSquare(state.boardState, color, square)
                    if (result) {
                        console.log("this test didn't pass", test)
                    }
                    expect(result).toBe(false)
                }
            }

        })
    })
})
