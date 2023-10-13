import { clone } from "ramda"

import { BITS, Color, CountType, Piece, SquareIndex } from "./constants"
import {
    countPiece,
    exportFen,
    extractInfoFromFen,
    forEachPiece,
    forEachPieceFromBoardState,
    getBoardStateFromBoardString,
    getPiecePositions,
    importFen,
    put,
    remove,
    removePiecePositionIfExists,
    updatePiecePositionDictionary,
} from "./state"
import { MoveObject, State } from "./types"


const { WHITE, BLACK } = Color
const {
    BIA,
    FLIPPED_BIA,
    MA,
    THON,
    MET,
    RUA,
    KHUN,
} = Piece
const {
    a8, b8, c8, d8, e8, f8, g8, h8,
    a7, b7, c7, d7, e7, f7, g7, h7,
    a6, b6, c6, d6, e6, f6, g6, h6,
    a5, b5, c5, d5, e5, f5, g5, h5,
    a4, b4, c4, d4, e4, f4, g4, h4,
    a3, b3, c3, d3, e3, f3, g3, h3,
    a2, b2, c2, d2, e2, f2, g2, h2,
    a1, b1, c1, d1, e1, f1, g1, h1,
} = SquareIndex
const {
    PIECE_POWER_COUNTDOWN,
    BOARD_POWER_COUNTDOWN,
} = CountType

describe("state", () => {
    describe("extractInfoFromFen", () => {
        test("number of inputs should be 3 or 8 only", () => {
            const validInputs = [
                "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 5 w bp 3 2 16",
                "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 5",
                // '1 2 3 4 5 6 7 8',
                // '1 2 3',
                // '                    1    2      3 ',
                // '   1 2      3        4      5   6        7  8',
            ]

            const invalidInputs = [
                "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 5 - -",
                "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w",
                "1",
                "1 2",
                "1 2 3 4",
                "1 2 3 4 5",
                "1 2 3 4 5 6",
                "1 2 3 4 5 6 7",
                "1 2 3 4 5 6 7 8 9",
                "1      ",
                "       1 2",
                "1                     2     3   ",
                "1    2     3   4",
                "     1     2    3             4     5     ",
                "1         2  3 4        5 6 7                                 ",
                "               1  2 3         4 5     6 7 8   9",
            ]

            for (const validInput of validInputs) {
                expect(extractInfoFromFen(validInput)).not.toBeNull()
                expect(extractInfoFromFen(validInput)).toBeInstanceOf(Object)
                expect(extractInfoFromFen(validInput)).not.toBeInstanceOf(Array)
            }

            for (const invalidInput of invalidInputs) {
                // expect(extractInfoFromFen(invalidInput)).toBeNull()
                try {
                    extractInfoFromFen(invalidInput)
                } catch (error: any) {
                    expect(error.code).toBe("WRONG_NUMBER_OF_INPUTS")
                }
            }
        })
    })


    describe("getBoardStateFromBoardString", () => {
        test("should transform board string to board state correctly", () => {
            const boardString = "rmtektmr/8/bbfbbbbb/8/8/BBBBFBBB/8/RMTKETMR"
            const boardState = [
                [WHITE, RUA],
                [WHITE, MA],
                [WHITE, THON],
                [WHITE, KHUN],
                [WHITE, MET],
                [WHITE, THON],
                [WHITE, MA],
                [WHITE, RUA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, FLIPPED_BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, FLIPPED_BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [BLACK, RUA],
                [BLACK, MA],
                [BLACK, THON],
                [BLACK, MET],
                [BLACK, KHUN],
                [BLACK, THON],
                [BLACK, MA],
                [BLACK, RUA],
                null, null, null, null, null, null, null, null,
            ]

            expect(getBoardStateFromBoardString(boardString)).toEqual(boardState)
        })
    })


    describe("forEachPieceFromBoardState", () => {
        const boardState: State["boardState"] = [
            [WHITE, RUA],
            [WHITE, MA],
            [WHITE, THON],
            [WHITE, KHUN],
            [WHITE, MET],
            [WHITE, THON],
            [WHITE, MA],
            [WHITE, RUA],
            null, null, null, null, null, null, null, null,

            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,

            [WHITE, BIA],
            [WHITE, BIA],
            [WHITE, BIA],
            [WHITE, BIA],
            [WHITE, BIA],
            [WHITE, BIA],
            [WHITE, BIA],
            [WHITE, BIA],
            null, null, null, null, null, null, null, null,

            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,

            [BLACK, BIA],
            [BLACK, BIA],
            [BLACK, BIA],
            [BLACK, BIA],
            [BLACK, BIA],
            [BLACK, BIA],
            [BLACK, BIA],
            [BLACK, BIA],
            null, null, null, null, null, null, null, null,

            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,

            [BLACK, RUA],
            [BLACK, MA],
            [BLACK, THON],
            [BLACK, MET],
            [BLACK, KHUN],
            [BLACK, THON],
            [BLACK, MA],
            [BLACK, RUA],
            null, null, null, null, null, null, null, null,
        ]

        test("number of iteration should equal to number of piece", () => {
            let num = 0

            forEachPieceFromBoardState(boardState, ([color, piece]) => {
                num++
            })

            expect(num).toBe(32)
        })

        test("piece count should be correct", () => {
            const colorNum = {
                [WHITE]: 0,
                [BLACK]: 0,
            }
            const pieceNum = {
                [BIA]: 0,
                [FLIPPED_BIA]: 0,
                [MA]: 0,
                [THON]: 0,
                [MET]: 0,
                [RUA]: 0,
                [KHUN]: 0,
            }
            const colorPieceNum = {
                [WHITE]: {
                    [BIA]: 0,
                    [FLIPPED_BIA]: 0,
                    [MA]: 0,
                    [THON]: 0,
                    [MET]: 0,
                    [RUA]: 0,
                    [KHUN]: 0,
                },
                [BLACK]: {
                    [BIA]: 0,
                    [FLIPPED_BIA]: 0,
                    [MA]: 0,
                    [THON]: 0,
                    [MET]: 0,
                    [RUA]: 0,
                    [KHUN]: 0,
                },
            }

            forEachPieceFromBoardState(boardState, ([color, piece]) => {
                colorNum[color]++
                pieceNum[piece]++
                colorPieceNum[color][piece]++
            })

            expect(colorNum[WHITE]).toBe(16)
            expect(colorNum[BLACK]).toBe(16)

            expect(pieceNum[BIA]).toBe(16)
            expect(pieceNum[FLIPPED_BIA]).toBe(0)
            expect(pieceNum[MA]).toBe(4)
            expect(pieceNum[THON]).toBe(4)
            expect(pieceNum[MET]).toBe(2)
            expect(pieceNum[RUA]).toBe(4)
            expect(pieceNum[KHUN]).toBe(2)

            expect(colorPieceNum[WHITE][BIA]).toBe(8)
            expect(colorPieceNum[WHITE][FLIPPED_BIA]).toBe(0)
            expect(colorPieceNum[WHITE][MA]).toBe(2)
            expect(colorPieceNum[WHITE][THON]).toBe(2)
            expect(colorPieceNum[WHITE][MET]).toBe(1)
            expect(colorPieceNum[WHITE][RUA]).toBe(2)
            expect(colorPieceNum[WHITE][KHUN]).toBe(1)

            expect(colorPieceNum[BLACK][BIA]).toBe(8)
            expect(colorPieceNum[BLACK][FLIPPED_BIA]).toBe(0)
            expect(colorPieceNum[BLACK][MA]).toBe(2)
            expect(colorPieceNum[BLACK][THON]).toBe(2)
            expect(colorPieceNum[BLACK][MET]).toBe(1)
            expect(colorPieceNum[BLACK][RUA]).toBe(2)
            expect(colorPieceNum[BLACK][KHUN]).toBe(1)
        })
    })


    describe("getPiecePositions", () => {
        test("piecePositions should be correct", () => {
            const boardState: State["boardState"] = [
                [WHITE, RUA],
                [WHITE, MA],
                [WHITE, THON],
                [WHITE, KHUN],
                [WHITE, MET],
                [WHITE, THON],
                [WHITE, MA],
                [WHITE, RUA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [BLACK, RUA],
                [BLACK, MA],
                [BLACK, THON],
                [BLACK, MET],
                [BLACK, KHUN],
                [BLACK, THON],
                [BLACK, MA],
                [BLACK, RUA],
                null, null, null, null, null, null, null, null,
            ]

            const piecePositions = {
                [WHITE]: {
                    [BIA]: [
                        a3, b3, c3, d3,
                        e3, f3, g3, h3,
                    ],
                    [FLIPPED_BIA]: [],
                    [MA]: [b1, g1],
                    [THON]: [c1, f1],
                    [MET]: [e1],
                    [RUA]: [a1, h1],
                    [KHUN]: [d1],
                },
                [BLACK]: {
                    [BIA]: [
                        a6, b6, c6, d6,
                        e6, f6, g6, h6,
                    ],
                    [FLIPPED_BIA]: [],
                    [MA]: [b8, g8],
                    [THON]: [c8, f8],
                    [MET]: [d8],
                    [RUA]: [a8, h8],
                    [KHUN]: [e8],
                },
            }

            expect(getPiecePositions(boardState)).toEqual(piecePositions)
        })
    })


    describe("forEachPiece", () => {
        const piecePositions = {
            [WHITE]: {
                [BIA]: [
                    a3, b3, c3, d3,
                    e3, f3, g3, h3,
                ],
                [FLIPPED_BIA]: [],
                [MA]: [b1, g1],
                [THON]: [c1, f1],
                [MET]: [e1],
                [RUA]: [a1, h1],
                [KHUN]: [d1],
            },
            [BLACK]: {
                [BIA]: [
                    a6, b6, c6, d6,
                    e6, f6, g6, h6,
                ],
                [FLIPPED_BIA]: [],
                [MA]: [b8, g8],
                [THON]: [c8, f8],
                [MET]: [d8],
                [RUA]: [a8, h8],
                [KHUN]: [e8],
            },
        }

        test("piece count must be the same", () => {

            let num = 0
            const colorNum = {
                [WHITE]: 0,
                [BLACK]: 0,
            }
            const pieceNum = {
                [BIA]: 0,
                [FLIPPED_BIA]: 0,
                [MA]: 0,
                [THON]: 0,
                [MET]: 0,
                [RUA]: 0,
                [KHUN]: 0,
            }
            const colorPieceNum = {
                [WHITE]: {
                    [BIA]: 0,
                    [FLIPPED_BIA]: 0,
                    [MA]: 0,
                    [THON]: 0,
                    [MET]: 0,
                    [RUA]: 0,
                    [KHUN]: 0,
                },
                [BLACK]: {
                    [BIA]: 0,
                    [FLIPPED_BIA]: 0,
                    [MA]: 0,
                    [THON]: 0,
                    [MET]: 0,
                    [RUA]: 0,
                    [KHUN]: 0,
                },
            }

            forEachPiece(piecePositions, (color, piece) => {
                num++
                colorNum[color]++
                pieceNum[piece]++
                colorPieceNum[color][piece]++
            })

            expect(num).toBe(32)

            expect(colorNum[WHITE]).toBe(16)
            expect(colorNum[BLACK]).toBe(16)

            expect(pieceNum[BIA]).toBe(16)
            expect(pieceNum[FLIPPED_BIA]).toBe(0)
            expect(pieceNum[MA]).toBe(4)
            expect(pieceNum[THON]).toBe(4)
            expect(pieceNum[MET]).toBe(2)
            expect(pieceNum[RUA]).toBe(4)
            expect(pieceNum[KHUN]).toBe(2)

            expect(colorPieceNum[WHITE][BIA]).toBe(8)
            expect(colorPieceNum[WHITE][FLIPPED_BIA]).toBe(0)
            expect(colorPieceNum[WHITE][MA]).toBe(2)
            expect(colorPieceNum[WHITE][THON]).toBe(2)
            expect(colorPieceNum[WHITE][MET]).toBe(1)
            expect(colorPieceNum[WHITE][RUA]).toBe(2)
            expect(colorPieceNum[WHITE][KHUN]).toBe(1)

            expect(colorPieceNum[BLACK][BIA]).toBe(8)
            expect(colorPieceNum[BLACK][FLIPPED_BIA]).toBe(0)
            expect(colorPieceNum[BLACK][MA]).toBe(2)
            expect(colorPieceNum[BLACK][THON]).toBe(2)
            expect(colorPieceNum[BLACK][MET]).toBe(1)
            expect(colorPieceNum[BLACK][RUA]).toBe(2)
            expect(colorPieceNum[BLACK][KHUN]).toBe(1)
        })


        test("piece position must be the same", () => {
            const newPiecePositions: State["piecePositions"] = {
                [WHITE]: {
                    [BIA]: [],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [],
                },
                [BLACK]: {
                    [BIA]: [],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [],
                },
            }

            forEachPiece(piecePositions, (color, piece, position) => {
                newPiecePositions[color][piece].push(position)
            })

            expect(newPiecePositions).toEqual(piecePositions)
        })
    })


    describe("countPiece", () => {
        const piecePositions = {
            [WHITE]: {
                [BIA]: [
                    a3, b3, c3, d3,
                    e3, f3, g3, h3,
                ],
                [FLIPPED_BIA]: [],
                [MA]: [b1, g1],
                [THON]: [c1, f1],
                [MET]: [e1],
                [RUA]: [a1, h1],
                [KHUN]: [d1],
            },
            [BLACK]: {
                [BIA]: [
                    a6, b6, c6, d6,
                    e6, f6, g6, h6,
                ],
                [FLIPPED_BIA]: [],
                [MA]: [b8, g8],
                [THON]: [c8, f8],
                [MET]: [d8],
                [RUA]: [a8, h8],
                [KHUN]: [e8],
            },
        }

        const pieceCount = {
            all: 32,

            color: {
                [WHITE]: 16,
                [BLACK]: 16,
            },
            piece: {
                [BIA]: 16,
                [FLIPPED_BIA]: 0,
                [MA]: 4,
                [THON]: 4,
                [MET]: 2,
                [RUA]: 4,
                [KHUN]: 2,
            },

            [WHITE]: {
                [BIA]: 8,
                [FLIPPED_BIA]: 0,
                [MA]: 2,
                [THON]: 2,
                [MET]: 1,
                [RUA]: 2,
                [KHUN]: 1,
            },
            [BLACK]: {
                [BIA]: 8,
                [FLIPPED_BIA]: 0,
                [MA]: 2,
                [THON]: 2,
                [MET]: 1,
                [RUA]: 2,
                [KHUN]: 1,
            },
        }

        test("should count piece correctly", () => {
            const pieceCountResult = countPiece(piecePositions)
            expect(pieceCountResult).toEqual(pieceCount)
        })
    })


    describe("updatePiecePositionDictionary", () => {
        const setup = () => {
            const piecePositions = {
                [WHITE]: {
                    [BIA]: [f5, g4],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [d1],
                },
                [BLACK]: {
                    [BIA]: [e6, h5],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [e8],
                },
            }
            return { piecePositions }
        }

        test("should move correctly", () => {
            const moveObject: MoveObject = {
                piece: BIA,
                color: WHITE,
                from: g4,
                to: g5,
                flags: 0,
            }
            const { piecePositions } = setup()
            updatePiecePositionDictionary(piecePositions, moveObject)
            expect(piecePositions[WHITE][BIA].sort()).toEqual([f5, g5].sort())
        })

        test("should capture correctly", () => {
            const moveObject = {
                piece: BIA,
                color: BLACK,
                from: h5,
                to: g4,
                flags: BITS.CAPTURE,
                captured: BIA,
            }
            const { piecePositions } = setup()
            updatePiecePositionDictionary(piecePositions, moveObject)
            expect(piecePositions[BLACK][BIA].sort()).toEqual([e6, g4].sort())
            expect(piecePositions[WHITE][BIA].sort()).toEqual([f5].sort())
        })

        test("should promote correctly", () => {
            const moveObject = {
                piece: BIA,
                color: WHITE,
                from: f5,
                to: f6,
                flags: BITS.PROMOTION,
                promotion: FLIPPED_BIA,
            }
            const { piecePositions } = setup()
            updatePiecePositionDictionary(piecePositions, moveObject)
            expect(piecePositions[WHITE][BIA].sort()).toEqual([g4].sort())
            expect(piecePositions[WHITE][FLIPPED_BIA].sort()).toEqual([f6].sort())
        })

        test("should capture and promote at the same time correctly", () => {
            const moveObject = {
                piece: BIA,
                color: WHITE,
                from: f5,
                to: e6,
                flags: BITS.CAPTURE | BITS.PROMOTION,
                captured: BIA,
                promotion: FLIPPED_BIA,
            }
            const { piecePositions } = setup()
            updatePiecePositionDictionary(piecePositions, moveObject)
            expect(piecePositions[WHITE][BIA].sort()).toEqual([g4].sort())
            expect(piecePositions[WHITE][FLIPPED_BIA].sort()).toEqual([e6].sort())
            expect(piecePositions[BLACK][BIA].sort()).toEqual([h5].sort())
        })

        describe("should throw error if not enough input", () => {
            test("not enough color", () => {
                expect.assertions(3)
                const { piecePositions } = setup()
                try {
                    updatePiecePositionDictionary(piecePositions, <MoveObject>{
                        piece: BIA,
                        from: f5,
                        to: e6,
                    })
                } catch (error: any) {
                    expect(error.code).toBe("NOT_ENOUGH_INPUT")
                    expect(error.requireMoreInput).toBeInstanceOf(Array)
                    expect(error.requireMoreInput.slice().sort()).toEqual(["color"])
                }
            })

            test("not enough piece", () => {
                expect.assertions(3)
                const { piecePositions } = setup()
                try {
                    updatePiecePositionDictionary(piecePositions, <MoveObject>{
                        color: WHITE,
                        from: f5,
                        to: e6,
                    })
                } catch (error: any) {
                    expect(error.code).toBe("NOT_ENOUGH_INPUT")
                    expect(error.requireMoreInput).toBeInstanceOf(Array)
                    expect(error.requireMoreInput.slice().sort()).toEqual(["piece"])
                }
            })

            test("not enough from", () => {
                expect.assertions(3)
                const { piecePositions } = setup()
                try {
                    updatePiecePositionDictionary(piecePositions, <MoveObject>{
                        piece: BIA,
                        color: WHITE,
                        to: e6,
                    })
                } catch (error: any) {
                    expect(error.code).toBe("NOT_ENOUGH_INPUT")
                    expect(error.requireMoreInput).toBeInstanceOf(Array)
                    expect(error.requireMoreInput.slice().sort()).toEqual(["from"])
                }
            })

            test("not enough to", () => {
                expect.assertions(3)
                const { piecePositions } = setup()
                try {
                    updatePiecePositionDictionary(piecePositions, <MoveObject>{
                        piece: BIA,
                        color: WHITE,
                        from: f5,
                    })
                } catch (error: any) {
                    expect(error.code).toBe("NOT_ENOUGH_INPUT")
                    expect(error.requireMoreInput).toBeInstanceOf(Array)
                    expect(error.requireMoreInput.slice().sort()).toEqual(["to"])
                }
            })

            test("not enough everything", () => {
                expect.assertions(3)
                const { piecePositions } = setup()
                try {
                    updatePiecePositionDictionary(piecePositions, <MoveObject>{})
                } catch (error: any) {
                    expect(error.code).toBe("NOT_ENOUGH_INPUT")
                    expect(error.requireMoreInput).toBeInstanceOf(Array)
                    expect(error.requireMoreInput.slice().sort()).toEqual(["color", "piece", "from", "to"].sort())
                }
            })

            test("if there's promotion flag then throw error if no 'promotion' exists in moveObject", () => {
                expect.assertions(3)
                const { piecePositions } = setup()
                try {
                    updatePiecePositionDictionary(piecePositions, {
                        piece: BIA,
                        color: WHITE,
                        from: f5,
                        to: e6,
                        flags: BITS.PROMOTION,
                    })
                } catch (error: any) {
                    expect(error.code).toBe("NOT_ENOUGH_INPUT")
                    expect(error.requireMoreInput).toBeInstanceOf(Array)
                    expect(error.requireMoreInput.slice().sort()).toEqual(["promotion"].sort())
                }
            })

            test("if there's capture flag then throw error if no 'captured' exists in moveObject", () => {
                expect.assertions(3)
                const { piecePositions } = setup()
                try {
                    updatePiecePositionDictionary(piecePositions, {
                        piece: BIA,
                        color: WHITE,
                        from: f5,
                        to: e6,
                        flags: BITS.CAPTURE,
                    })
                } catch (error: any) {
                    expect(error.code).toBe("NOT_ENOUGH_INPUT")
                    expect(error.requireMoreInput).toBeInstanceOf(Array)
                    expect(error.requireMoreInput.slice().sort()).toEqual(["captured"].sort())
                }
            })
        })
    })


    describe("removePiecePositionIfExists", () => {
        const setup = () => {
            const piecePositions = {
                [WHITE]: {
                    [BIA]: [f5, g4],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [d1],
                },
                [BLACK]: {
                    [BIA]: [e6, h5],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [e8],
                },
            }

            const boardState = Array(128).fill(null)
            boardState[f5] = [WHITE, BIA]
            boardState[g4] = [WHITE, BIA]
            boardState[d1] = [WHITE, KHUN]
            boardState[e6] = [BLACK, BIA]
            boardState[h5] = [BLACK, BIA]
            boardState[e8] = [BLACK, KHUN]
            return { piecePositions, boardState }
        }

        test("remove piece f5 correctly", () => {
            const square = f5
            const { piecePositions, boardState } = setup()
            removePiecePositionIfExists(piecePositions, boardState, square)
            expect(piecePositions[WHITE][BIA]).not.toContain(square)
        })

        test("remove piece g4 correctly", () => {
            const square = g4
            const { piecePositions, boardState } = setup()
            removePiecePositionIfExists(piecePositions, boardState, square)
            expect(piecePositions[WHITE][BIA]).not.toContain(square)
        })

        test("remove piece d1 correctly", () => {
            const square = d1
            const { piecePositions, boardState } = setup()
            removePiecePositionIfExists(piecePositions, boardState, square)
            expect(piecePositions[WHITE][KHUN]).not.toContain(square)
        })

        test("remove piece e6 correctly", () => {
            const square = e6
            const { piecePositions, boardState } = setup()
            removePiecePositionIfExists(piecePositions, boardState, square)
            expect(piecePositions[BLACK][BIA]).not.toContain(square)
        })

        test("remove piece h5 correctly", () => {
            const square = h5
            const { piecePositions, boardState } = setup()
            removePiecePositionIfExists(piecePositions, boardState, square)
            expect(piecePositions[BLACK][BIA]).not.toContain(square)
        })

        test("remove piece e8 correctly", () => {
            const square = e8
            const { piecePositions, boardState } = setup()
            removePiecePositionIfExists(piecePositions, boardState, square)
            expect(piecePositions[BLACK][KHUN]).not.toContain(square)
        })
    })


    describe("put", () => {
        const setup = () => {
            const piecePositions = {
                [WHITE]: {
                    [BIA]: [f5, g4],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [d1],
                },
                [BLACK]: {
                    [BIA]: [e6, h5],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [e8],
                },
            }

            const boardState = Array(128).fill(null)
            boardState[f5] = [WHITE, BIA]
            boardState[g4] = [WHITE, BIA]
            boardState[d1] = [WHITE, KHUN]
            boardState[e6] = [BLACK, BIA]
            boardState[h5] = [BLACK, BIA]
            boardState[e8] = [BLACK, KHUN]

            const state: State = {
                activeColor: WHITE,
                moveNumber: 1,
                history: [],
                future: [],
                boardState,
                piecePositions,
                countdown: null,
                countdownHistory: [],
                fenOccurrence: {},
            }

            return { state }
        }

        test("put empty square", () => {
            const color = WHITE
            const piece = RUA
            const square = f7

            const { state } = setup()
            put(state, color, piece, square)
            expect(state.boardState[square]).toEqual([color, piece])
            expect(state.piecePositions[color][piece]).toContain(square)
        })

        test("put non empty square", () => {
            const color = BLACK
            const piece = MA
            const square = g4

            const { state } = setup()
            put(state, color, piece, square)
            expect(state.piecePositions[color][piece]).toContain(square)
            expect(state.piecePositions[WHITE][BIA]).not.toContain(square)
        })
    })


    describe("remove", () => {
        const setup = () => {
            const piecePositions = {
                [WHITE]: {
                    [BIA]: [f5, g4],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [d1],
                },
                [BLACK]: {
                    [BIA]: [e6, h5],
                    [FLIPPED_BIA]: [],
                    [MA]: [],
                    [THON]: [],
                    [MET]: [],
                    [RUA]: [],
                    [KHUN]: [e8],
                },
            }

            const boardState = Array(128).fill(null)
            boardState[f5] = [WHITE, BIA]
            boardState[g4] = [WHITE, BIA]
            boardState[d1] = [WHITE, KHUN]
            boardState[e6] = [BLACK, BIA]
            boardState[h5] = [BLACK, BIA]
            boardState[e8] = [BLACK, KHUN]

            const state: State = {
                activeColor: WHITE,
                moveNumber: 1,
                history: [],
                future: [],
                boardState,
                piecePositions,
                countdown: null,
                countdownHistory: [],
                fenOccurrence: {},
            }
            return { state }
        }

        test("remove empty square", () => {
            const square = f7
            const { state } = setup()
            remove(state, square)
            expect(state.boardState[square]).toBeFalsy()
        })

        test("remove non empty square", () => {
            const square = h5
            const { state } = setup()
            remove(state, square)
            expect(state.boardState[square]).toBeFalsy()
            expect(state.piecePositions[BLACK][BIA]).not.toContain(square)
        })
    })


    describe("import export fen", () => {
        const fen = "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1"
        const state: State = {
            boardState: [
                [WHITE, RUA],
                [WHITE, MA],
                [WHITE, THON],
                [WHITE, KHUN],
                [WHITE, MET],
                [WHITE, THON],
                [WHITE, MA],
                [WHITE, RUA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                [WHITE, BIA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                [BLACK, BIA],
                null, null, null, null, null, null, null, null,

                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,

                [BLACK, RUA],
                [BLACK, MA],
                [BLACK, THON],
                [BLACK, MET],
                [BLACK, KHUN],
                [BLACK, THON],
                [BLACK, MA],
                [BLACK, RUA],
                null, null, null, null, null, null, null, null,
            ],
            activeColor: WHITE,
            moveNumber: 1,
            countdownHistory: [],
            countdown: null,
            piecePositions: {
                [WHITE]: {
                    [BIA]: [
                        a3, b3, c3, d3,
                        e3, f3, g3, h3,
                    ],
                    [FLIPPED_BIA]: [],
                    [MA]: [b1, g1],
                    [THON]: [c1, f1],
                    [MET]: [e1],
                    [RUA]: [a1, h1],
                    [KHUN]: [d1],
                },
                [BLACK]: {
                    [BIA]: [
                        a6, b6, c6, d6,
                        e6, f6, g6, h6,
                    ],
                    [FLIPPED_BIA]: [],
                    [MA]: [b8, g8],
                    [THON]: [c8, f8],
                    [MET]: [d8],
                    [RUA]: [a8, h8],
                    [KHUN]: [e8],
                },
            },
            fenOccurrence: {
                [fen]: 1,
            },
        }

        test("should import fen to state correctly", () => {
            const stateResult = importFen(fen)
            expect(stateResult).toEqual(state)
        })

        test("should export state to fen correctly", () => {
            const fenResult = exportFen(state)
            expect(fenResult).toBe(fen)
        })

        // TODO: test import/export fen with countdown

        test("should throw error when import fen", () => {
            const tests = [
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 -",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - -",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - - -",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - - - -",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - - - - - -",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },
                {
                    fen: "- rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 -",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },
                {
                    fen: "- - rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_NUMBER_OF_INPUTS",
                },


                {
                    fen: "ratektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_CHARACTER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BPBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_CHARACTER",
                },
                {
                    fen: "rmtektmd/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_CHARACTER",
                },
                {
                    fen: "rmtektmg/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_CHARACTER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/-BBBBBBB/8/RMTKETMR w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_CHARACTER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/+BBBBBBB/8/RMTKETMR w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_CHARACTER",
                },


                {
                    fen: "rmtektmr w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },
                {
                    fen: "rmtektmr/8 w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8 w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8 w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8 w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR/8 w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR/8/bbbbbbbb w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_RANKS",
                },


                {
                    fen: "rmtektmr/53/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_NEXT_TO_EACH_OTHER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/71/8/BBBBBBBB/8/RMTKETMR w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_NEXT_TO_EACH_OTHER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/26/BBBBBBBB/8/RMTKETMR w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_NEXT_TO_EACH_OTHER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/44/RMTKETMR w 1 - - - - -",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_NEXT_TO_EACH_OTHER",
                },


                {
                    fen: "rmte/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
                },
                {
                    fen: "rmtektmr/5/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
                },
                {
                    fen: "rmtektmr/8/bbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/7/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/7/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/5/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/MR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES",
                },


                {
                    fen: "rmtektmr/7/bbbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES_PER_RANK",
                },
                {
                    fen: "r/8mtektmr/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES_PER_RANK",
                },
                {
                    fen: "rmtektmr7bbbbbbb7BBBBBBB7RMTK7TMR/1/b/1/1/B/1/E w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_SQUARES_PER_RANK",
                },


                {
                    fen: "rmtektmk/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_KHUNS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/KMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_KHUNS",
                },
                {
                    fen: "rmtertmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_KHUNS",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTRETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_KHUNS",
                },
                {
                    fen: "rmtertmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTRETMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_KHUNS",
                },
                {
                    fen: "rmtekkmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKKTMR w 1",
                    errorCode: "WRONG_BOARD_STRING_NUMBER_OF_KHUNS",
                },


                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR W 1 - - - - -",
                    errorCode: "WRONG_ACTIVE_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR B 1",
                    errorCode: "WRONG_ACTIVE_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR WHITE 1 - - - - -",
                    errorCode: "WRONG_ACTIVE_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR BLACK 1",
                    errorCode: "WRONG_ACTIVE_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR white 1 - - - - -",
                    errorCode: "WRONG_ACTIVE_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR black 1",
                    errorCode: "WRONG_ACTIVE_COLOR",
                },


                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 01",
                    errorCode: "WRONG_MOVE_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 0",
                    errorCode: "WRONG_MOVE_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w +1",
                    errorCode: "WRONG_MOVE_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w -1",
                    errorCode: "WRONG_MOVE_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 0x88",
                    errorCode: "WRONG_MOVE_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w white",
                    errorCode: "WRONG_MOVE_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w b",
                    errorCode: "WRONG_MOVE_NUMBER",
                },


                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 b - - - -",
                    errorCode: "WRONG_COUNTDOWN",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - bp - - -",
                    errorCode: "WRONG_COUNTDOWN",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - - 5 - -",
                    errorCode: "WRONG_COUNTDOWN",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 b pp - - -",
                    errorCode: "WRONG_COUNTDOWN",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 b - 6 - -",
                    errorCode: "WRONG_COUNTDOWN",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 - bp 6 - -",
                    errorCode: "WRONG_COUNTDOWN",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 b bp 6 1 -",
                    errorCode: "WRONG_COUNTDOWN",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 b bp 6 - 16",
                    errorCode: "WRONG_COUNTDOWN",
                },


                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 white bp 6 1 16",
                    errorCode: "WRONG_COUNT_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 black bp 6 1 16",
                    errorCode: "WRONG_COUNT_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 W bp 6 1 16",
                    errorCode: "WRONG_COUNT_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 B bp 6 1 16",
                    errorCode: "WRONG_COUNT_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 + bp 6 1 16",
                    errorCode: "WRONG_COUNT_COLOR",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 / bp 6 1 16",
                    errorCode: "WRONG_COUNT_COLOR",
                },


                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pb 6 1 16",
                    errorCode: "WRONG_COUNT_TYPE",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w bb 6 1 16",
                    errorCode: "WRONG_COUNT_TYPE",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w 5 6 1 16",
                    errorCode: "WRONG_COUNT_TYPE",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w b 6 1 16",
                    errorCode: "WRONG_COUNT_TYPE",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w p 6 1 16",
                    errorCode: "WRONG_COUNT_TYPE",
                },


                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 06 1 16",
                    errorCode: "WRONG_COUNT_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 0 1 16",
                    errorCode: "WRONG_COUNT_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp +6 1 16",
                    errorCode: "WRONG_COUNT_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w bp -6 1 16",
                    errorCode: "WRONG_COUNT_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w bp 0x88 1 16",
                    errorCode: "WRONG_COUNT_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp w 1 16",
                    errorCode: "WRONG_COUNT_NUMBER",
                },


                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 1 06 16",
                    errorCode: "WRONG_COUNT_FROM_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 1 0 16",
                    errorCode: "WRONG_COUNT_FROM_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 1 +6 16",
                    errorCode: "WRONG_COUNT_FROM_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w bp 1 -6 16",
                    errorCode: "WRONG_COUNT_FROM_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w bp 1 0x88 16",
                    errorCode: "WRONG_COUNT_FROM_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 1 w 16",
                    errorCode: "WRONG_COUNT_FROM_NUMBER",
                },


                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 1 16 06",
                    errorCode: "WRONG_COUNT_TO_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 1 16 0",
                    errorCode: "WRONG_COUNT_TO_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 1 16 +6",
                    errorCode: "WRONG_COUNT_TO_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w bp 1 16 -6",
                    errorCode: "WRONG_COUNT_TO_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w bp 1 16 0x88",
                    errorCode: "WRONG_COUNT_TO_NUMBER",
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w pp 1 16 w",
                    errorCode: "WRONG_COUNT_TO_NUMBER",
                },
            ]

            expect.assertions(tests.length)

            for (const test of tests) {
                try {
                    importFen(<string>test.fen)
                    console.log("this input didn't throw error", test)
                } catch (error: any) {
                    expect(error.code).toBe(test.errorCode)
                    if (!error.hasOwnProperty("code")) {
                        console.log(error)
                    }
                }
            }
        })


        test("should import fen with countdown correctly", () => {
            const tests = [
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 w bp 3 2 16",
                    result: {
                        countColor: WHITE,
                        countType: BOARD_POWER_COUNTDOWN,
                        count: 3,
                        countFrom: 2,
                        countTo: 16,
                    },
                },
                {
                    fen: "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1 b pp 33 10 30",
                    result: {
                        countColor: BLACK,
                        countType: PIECE_POWER_COUNTDOWN,
                        count: 33,
                        countFrom: 10,
                        countTo: 30,
                    },
                },
            ]

            for (const test of tests) {
                const result = importFen(test.fen)
                expect(result.countdown).toEqual(test.result)
            }
        })


        test("should export state to fen with countdown correctly", () => {
            const newState = clone(state)

            newState.countdown = {
                countColor: BLACK,
                countType: BOARD_POWER_COUNTDOWN,
                count: 11,
                countFrom: 1,
                countTo: 16,
            }
            expect(exportFen(newState).split(" ").slice(3).join(" ")).toBe("b bp 11 1 16")

            newState.countdown = {
                countColor: WHITE,
                countType: PIECE_POWER_COUNTDOWN,
                count: 29,
                countFrom: 1,
                countTo: 16,
            }
            expect(exportFen(newState).split(" ").slice(3).join(" ")).toBe("w pp 29 1 16")

            newState.countdown = null
            expect(exportFen(newState).split(" ").length).toBe(3)
        })
    })
})
