const {
    WHITE,
    BLACK,

    BIA,
    FLIPPED_BIA,
    MA,
    THON,
    MET,
    RUA,
    KHUN,

    INITIAL_FEN,
    EMPTY_FEN,

    BIA_MOVE_OFFSETS,
    BIA_ATTACK_OFFSETS,
    THON_MOVE_OFFSETS,
    THON_ATTACK_OFFSETS,
    PIECE_MOVE_OFFSETS,
    PIECE_ATTACK_OFFSETS,

    IS_SLIDING_PIECE,

    PIECE_POWER,

    SQUARES,
    FIRST_SQUARE,
    LAST_SQUARE,

    FLAGS,
    BITS,

    RANK_1,
    RANK_2,
    RANK_3,
    RANK_4,
    RANK_5,
    RANK_6,
    RANK_7,
    RANK_8,
    
    FILE_A,
    FILE_B,
    FILE_C,
    FILE_D,
    FILE_E,
    FILE_F,
    FILE_G,
    FILE_H,

    PIECE_POWER_COUNTDOWN,
    BOARD_POWER_COUNTDOWN
} = require('../src/constants')

const {
    swapColor,
    getAttackOffsets,
    getMoveOffsets,
    rank,
    file,
    squareColor,
    algebraic,
    ascii,
    clone,
    compose,
    pipe
} = require('../src/utils')

const {
    extractInfoFromFen,
    getBoardStateFromBoardString,
    forEachPieceFromBoardState,
    getPiecePositions,
    forEachPiece,
    countPiece,
    evalulatePower,
    updatePiecePositionDictionary,
    removePiecePositionIfExists,
    put,
    remove,
    importFen,
    exportFen
} = require('../src/state')

const {
    canThisColorAttackThisSquare,
    isKhunAttacked,
    inCheck,
    inCheckmate,
    inStalemate,
    inDraw,
    gameOver,
    calculateCountdown,

    changePiecePosition,
    step,
    stepCountdown,
    stepBackCountdown,
    makeMove,
    undoMove,
    nextMove,

    generateMoves,
    generateLegalMoves,
    move,
} = require('../src/move')


const {
    a8, b8, c8, d8, e8, f8, g8, h8,
    a7, b7, c7, d7, e7, f7, g7, h7,
    a6, b6, c6, d6, e6, f6, g6, h6,
    a5, b5, c5, d5, e5, f5, g5, h5,
    a4, b4, c4, d4, e4, f4, g4, h4,
    a3, b3, c3, d3, e3, f3, g3, h3,
    a2, b2, c2, d2, e2, f2, g2, h2,
    a1, b1, c1, d1, e1, f1, g1, h1
} = SQUARES
 
describe('canThisColorAttackThisSquare', () => {
    // TODO
    const state = importFen(EMPTY_FEN)

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
            color: BLACK,
            piece: THON,
            square: f5,
            canAttack: [e4, f4, g4, e6, g6],
            cannotAttack: [e5, g5, f6],
        },
    ]

    test('can perform correctly', () => {
        for (const test of tests) {
            const {
                color,
                piece,
                square,
                func,
                canAttack,
                cannotAttack,
            } = test

            const newState = put(state, color, piece, square)
            
            // const newState = pipe(
            //     put(state, color, piece, square),
            //     state => state
            // )(state)
    
            for (const square of canAttack) {
                const result = canThisColorAttackThisSquare(newState.boardState, color, square)
                expect(result).toBe(true)
                if (result !== true) {
                    console.log('this test didn\'t pass', test)
                }
            }
            for (const square of cannotAttack) {
                const result = canThisColorAttackThisSquare(newState.boardState, color, squareColor)
                expect(result).toBe(false)
                if (result !== false) {
                    console.log('this test didn\'t pass', test)
                }
            }
        }

    })
})