import { printBoard } from "./utils"

import { generateLegalMoves, move, moveToSan } from "./move"

import { importFen } from "./state"

import { State } from "./types"
import { evaluate, findBestMove } from "./evaluation"
import { CountType, INITIAL_FEN } from "./constants/Board"
import { Makruk } from "./Makruk"
import { isGameOver } from "./gameStatus"

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max))
}

function runUntilGameFinished(state?: State) {
    const makruk = new Makruk()
    let i = 0
    while (!makruk.isGameOver()) {
        if (i === 100) {
            break
        }
        console.log("round", i)
        console.log("score", evaluate(makruk.state))
        // console.log('gameOver(makruk.state)', gameOver(makruk.state))
        // console.log('inCheckmate(makruk.state)', inCheckmate(makruk.state))
        // console.log('makruk.state.activeColor', makruk.state.activeColor)
        // console.log('inCheck(makruk.state)', inCheck(makruk.state))
        // const m = generateLegalMoves(makruk.state)
        // console.log("m", m.map(mm => moveToSan(makruk.state, mm)))
        // console.log("legal moves", generateLegalMoves(makruk.state).map(m => moveToSan(makruk.state, m)))
        const { bestMove, bestScore } = findBestMove(makruk.state, 3)
        if (!bestMove) {
            console.log(makruk.state.activeColor === "w" ? "white" : "black", "resign")
            break
        }
        console.log("best", bestMove)
        console.log("bestMove", moveToSan(makruk.state, bestMove), bestScore)
        // const moves = generateLegalMoves(makruk.state)
        // const choosenMove = moves[getRandomInt(moves.length)]
        // makruk.state = move(makruk.state, choosenMove)
        makruk.move(bestMove!)
        i++

        console.log(printBoard(makruk.state.boardState))
    }
    console.log("game over!")
}


// const info = getInfoFromStateString(INITIAL_FEN)
// const boardState = getBoardStateFromBoardString(info.boardString)
// console.log(boardState)

// const state = importFen(INITIAL_FEN)
// const state = importFen('T6T/8/5K2/8/2k5/8/8/t6t w 25')
// console.log(state)
// const allMoves = generateAllMoves(state)
// console.log(allMoves)

// console.log(generateMovesForOneSquare(state.boardState, SQUARES.e3))
// console.log(generateMoves(state.boardState))

// console.log(ascii(state.boardState))
// console.log(calculateCountdown(state))
// console.log(generateMoves(state))

// console.log('state.activeColor', state.activeColor)

runUntilGameFinished()

// function testCount() {
//     const state = importFen("T6T/8/5K2/8/2k5/8/8/t6t w 25")
//     console.log(printBoard(state.boardState))
//
//     const state2 = move(state, "Ke6", { startBoardPowerCountdown: true })
//     console.log(printBoard(state2.boardState))
//     console.log("2", state2.countdown)
//
//     const state3 = move(state2, "Kd4")
//     console.log(printBoard(state3.boardState))
//     console.log("3", state3.countdown)
//
//     const state4 = move(state3, "Kf7")
//     console.log(printBoard(state4.boardState))
//     console.log("4", state4.countdown)
//
//
//     const state3undo = undoMove(state4)
//     console.log(printBoard(state3undo.boardState))
//     console.log("3 undo", state3undo.countdown)
//
//     const state2undo = undoMove(state3undo)
//     console.log(printBoard(state2undo.boardState))
//     console.log("2 undo", state2undo.countdown)
//
//     const stateundo = undoMove(state2undo)
//     console.log(printBoard(stateundo.boardState))
//     console.log("1 undo", stateundo.countdown)
//
//     const state2next = nextMove(stateundo)
//     console.log(printBoard(state2next.boardState))
//     console.log("2 next", state2next.countdown)
//
//     const state3next = nextMove(state2next)
//     console.log(printBoard(state3next.boardState))
//     console.log("2 next", state3next)
//
//     const state4next = nextMove(state3next)
//     console.log(printBoard(state4next.boardState))
//     console.log("2 next", state4next.countdown)
//
//
//     if (!state4next.countdown) {
//         state4next.countdown = {
//             countColor: state4next.activeColor,
//             countType: CountType.BOARD_POWER_COUNTDOWN,
//             count: 1,
//             countFrom: 1,
//             countTo: 8,
//         }
//     }
//     state4next.countdown.countTo = 8
//     const state5 = move(state4next, "Ke4")
//     console.log(printBoard(state5.boardState))
//     console.log(state5.countdown)
//
//     const state6 = move(state5, "Kg6")
//     console.log(printBoard(state6.boardState))
//     console.log(state6.countdown)
//
//     const state7 = move(state6, "Kf4")
//     console.log(printBoard(state7.boardState))
//     console.log(state7.countdown)
//
//     console.log("gameover", gameOver(state5))
//     console.log("gameover", gameOver(state6))
//     console.log("gameover", gameOver(state7))
//
//
// }

// testCount()

// const state5 = move(state4, 'Kc3')
// console.log(ascii(state5.boardState))
// console.log('5', state5.countdown)

// const newBoardState = changePiecePosition(state.boardState, SQUARES.e3, SQUARES.e4)
// // console.log(newBoardState)
// console.log(ascii(newBoardState))


// console.log(extract0x88Move({ notation: 're2' }))
// console.log('ญ7=F≠'.match(sanRegex))
// console.log(move_from_san(state.boardState, 'Me2'))

// console.log(ascii(move(state, 'e4').boardState))
// console.log(ascii(move(state, 'Tf2').boardState))
// console.log(ascii(move(state, { from: 'e3', to: 'e7' }).boardState))

// console.log(state)
// console.log(move(state, 'e4'))
// console.log(move(move(state, 'e4'), 'e5'))

// console.log(ascii(state.boardState))
// const state2 = move(state, 'e4')
// console.log(ascii(state2.boardState))
// const state3 = move(state2, 'd5')
// console.log(ascii(state3.boardState))
// const state4 = move(state3, 'exd5')
// console.log(ascii(state4.boardState))

// console.log(state.piecePositions[WHITE][BIA])
// console.log(state.piecePositions[BLACK][BIA])

// console.log(state2.piecePositions[WHITE][BIA])
// console.log(state2.piecePositions[BLACK][BIA])

// console.log(state3.piecePositions[WHITE][BIA])
// console.log(state3.piecePositions[BLACK][BIA])

// console.log(state4.piecePositions[WHITE][BIA])
// console.log(state4.piecePositions[BLACK][BIA])

// forEachPiece(state4.piecePositions, console.log)

// console.log(canThisColorAttackThisSquare(state.boardState, WHITE, SQUARES.d5))
// console.log(canThisColorAttackThisSquare(state2.boardState, WHITE, SQUARES.d5))
// console.log(canThisColorAttackThisSquare(state3.boardState, WHITE, SQUARES.d5))
// console.log(state3)

// console.log(state)
// console.log(exportFen(state))

// performanceTest()
// console.log(countPiece(state.piecePositions))
// console.log(generateMoves(state))

// console.log(JSON.stringify(state).length)
