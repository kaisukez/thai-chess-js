import { Color, EMPTY_FEN, Piece, SquareIndex } from "./constants"
import { importFen, put } from "./state"
import { canThisColorAttackThisSquare } from "./gameStatus"
import { getAlgebraic } from "./utils"

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

describe("gameStatus", () => {
    describe("canThisColorAttackThisSquare", () => {
        const setup = () => {
            const state = importFen(EMPTY_FEN)
            put(state, WHITE, BIA, c5)
            return { state }
        }

        const testScenarios = [
            {
                case: 1,
                color: WHITE,
                piece: BIA,
                square: f5,
                canAttack: [e6, g6],
                cannotAttack: [f5, f6, e4, g4],
            },
            {
                case: 2,
                color: BLACK,
                piece: BIA,
                square: f5,
                canAttack: [e4, g4],
                cannotAttack: [f5, f4, e6, g6],
            },
            {
                case: 3,
                color: WHITE,
                piece: THON,
                square: f5,
                canAttack: [e6, f6, g6, e4, g4],
                cannotAttack: [e5, g5, f4],
            },
            {
                case: 4,
                color: BLACK,
                piece: THON,
                square: f5,
                canAttack: [e4, f4, g4, e6, g6],
                cannotAttack: [e5, g5, f6],
            },

            {
                case: 5,
                color: WHITE,
                piece: FLIPPED_BIA,
                square: f5,
                canAttack: [e6, g6, e4, g4],
                cannotAttack: [f6, e5, g5, f4],
            },
            {
                case: 6,
                color: BLACK,
                piece: FLIPPED_BIA,
                square: f5,
                canAttack: [e6, g6, e4, g4],
                cannotAttack: [f6, e5, g5, f4],
            },
            {
                case: 7,
                color: WHITE,
                piece: MET,
                square: f5,
                canAttack: [e6, g6, e4, g4],
                cannotAttack: [f6, e5, g5, f4],
            },
            {
                case: 8,
                color: BLACK,
                piece: MET,
                square: f5,
                canAttack: [e6, g6, e4, g4],
                cannotAttack: [f6, e5, g5, f4],
            },

            {
                case: 9,
                color: WHITE,
                piece: MA,
                square: f5,
                canAttack: [e7, g7, d6, h6, d4, h4, e3, g3],
                cannotAttack: [d7, f7, h7, e6, f6, g6, d5, e5, g5, h5, e4, f4, g4, d3, f3, h3],
            },
            {
                case: 10,
                color: BLACK,
                piece: MA,
                square: f5,
                canAttack: [e7, g7, d6, h6, d4, h4, e3, g3],
                cannotAttack: [d7, f7, h7, e6, f6, g6, d5, e5, g5, h5, e4, f4, g4, d3, f3, h3],
            },

            {
                case: 11,
                color: WHITE,
                piece: KHUN,
                square: f5,
                canAttack: [e6, f6, g6, e5, g5, e4, f4, g4],
                cannotAttack: [],
            },
            {
                case: 12,
                color: BLACK,
                piece: KHUN,
                square: f5,
                canAttack: [e6, f6, g6, e5, g5, e4, f4, g4],
                cannotAttack: [],
            },

            {
                case: 13,
                color: WHITE,
                piece: RUA,
                square: e4,
                canAttack: [e5, e6, e7, e8, f4, g4, h4, e3, e2, e1, d4, c4, b4, a4],
                cannotAttack: [],
            },
            {
                case: 14,
                color: BLACK,
                piece: RUA,
                square: e4,
                canAttack: [e5, e6, e7, e8, f4, g4, h4, e3, e2, e1, d4, c4, b4, a4],
                cannotAttack: [],
            },
            {
                case: 15,
                color: WHITE,
                piece: RUA,
                square: f5,
                canAttack: [f6, f7, f8, g5, h5, f4, f3, f2, f1, e5, d5, c5],
                cannotAttack: [b5, a5],
            },
            {
                case: 16,
                color: BLACK,
                piece: RUA,
                square: f5,
                canAttack: [f6, f7, f8, g5, h5, f4, f3, f2, f1, e5, d5, c5],
                cannotAttack: [b5, a5],
            },
        ]

        const testCases = testScenarios.flatMap(scenario => [
            ...scenario.canAttack.map(target => ({
                ...scenario, action: "should",
                squareName: getAlgebraic(scenario.square),
                target,
                targetName: getAlgebraic(target),
            })),
            ...scenario.cannotAttack.map(target => ({
                ...scenario, action: "should not",
                squareName: getAlgebraic(scenario.square),
                target,
                targetName: getAlgebraic(target),
            })),
        ])

        test.each(testCases)(`
            [case $case] it $action be able to attack $targetName square when using $color $piece from $squareName
        `, ({ color, piece, square, action, target }) => {
            const { state } = setup()
            put(state, color, piece, square)

            const result = canThisColorAttackThisSquare(state.boardState, color, target)
            expect(result).toBe(action === "should")
        })
    })
})
