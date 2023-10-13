import { CountdownFlag } from "./move"
import { Color, CountType, Piece, SquareIndex } from "./constants"

export type SquareData = [Color, Piece];

export type Countdown = {
    // fromMove: number
    countColor: Color;
    countType: CountType;
    count: number;
    countFrom: number;
    countTo: number;
};

export type MoveObject = {
    color: Color;
    piece: Piece;
    from: SquareIndex;
    to: SquareIndex;
    flags: number;
    promotion?: Piece;
    captured?: Piece;
    optional?: CountdownFlag;
    score?: number;
};
export type Move = string | MoveObject;

export type State = {
    activeColor: Color;
    moveNumber: number;
    boardState: Array<SquareData | null>;
    history?: MoveObject[];
    future?: MoveObject[];
    piecePositions: Record<Color, Record<Piece, number[]>>;
    countdown: Countdown | null;
    countdownHistory: Countdown[];
    fenOccurrence: Record<string, number>;
};

export type PieceCount = {
    all: number;
    color: Record<Color, number>;
    piece: Record<Piece, number>;
    [Color.WHITE]: Record<Piece, number>;
    [Color.BLACK]: Record<Piece, number>;
};

export function toEnum<E extends Record<string, E[keyof E]>>(
    e: E,
    s: string,
): E[keyof E] {
    for (const [key, value] of Object.entries(e)) {
        if (s === String(value)) {
            return e[key]
        }
    }
    throw {
        code: "CANT_CONVERT_STRING_TO_ENUM",
        message: "can't convert string to enum",
    }
}
