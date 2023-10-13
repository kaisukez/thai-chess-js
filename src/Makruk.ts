import { State } from "./types"
import { importFen } from "./state"
import { INITIAL_FEN } from "./constants/Board"

class Makruk {
    state: State

    constructor() {
        this.state = importFen(INITIAL_FEN)
    }
}
