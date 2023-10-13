import { Move, State } from "./types"
import { importFen } from "./state"
import { move } from "./move"
import { INITIAL_FEN } from "./constants"
import { isGameOver } from "./gameStatus"

export class Makruk {
    state: State

    constructor() {
        this.state = importFen(INITIAL_FEN)
    }

    move(aMove: Move) {
        move(this.state, aMove)
    }

    isGameOver() {
        return isGameOver(this.state)
    }
}
