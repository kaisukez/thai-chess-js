// https://www.chessvariants.com/oriental.dir/thai.html

export enum Piece {
    BIA = "b",
    FLIPPED_BIA = "f",
    MA = "m",
    THON = "t", // using THON instead of KHON to distinguish between 't' and 'k'
    MET = "e", // using e because 'm' is already used for 'MA'
    RUA = "r",
    KHUN = "k",
}

export enum Color {
    WHITE = "w",
    BLACK = "b",
}

// http://bgsthai.com/2018/04/30/howtoplay/
export const PIECE_POWER = {
    [Piece.BIA]: 1,
    [Piece.FLIPPED_BIA]: 1.7,
    [Piece.MA]: 3,
    [Piece.THON]: 2.6,
    [Piece.MET]: 1.7,
    [Piece.RUA]: 5,
    [Piece.KHUN]: 0,
} as const

export const WHITE_BIA_SHIFT = 0
export const BLACK_BIA_SHIFT = 1
export const FLIPPED_BIA_SHIFT = 2
export const MA_SHIFT = 3
export const WHITE_THON_SHIFT = 4
export const BLACK_THON_SHIFT = 5
export const MET_SHIFT = 6
export const RUA_SHIFT = 7
export const KHUN_SHIFT = 8

export const SHIFTS = {
    [Color.WHITE]: {
        [Piece.BIA]: WHITE_BIA_SHIFT,
        [Piece.FLIPPED_BIA]: FLIPPED_BIA_SHIFT,
        [Piece.MA]: MA_SHIFT,
        [Piece.THON]: WHITE_THON_SHIFT,
        [Piece.MET]: MET_SHIFT,
        [Piece.RUA]: RUA_SHIFT,
        [Piece.KHUN]: KHUN_SHIFT,
    },
    [Color.BLACK]: {
        [Piece.BIA]: BLACK_BIA_SHIFT,
        [Piece.FLIPPED_BIA]: FLIPPED_BIA_SHIFT,
        [Piece.MA]: MA_SHIFT,
        [Piece.THON]: BLACK_THON_SHIFT,
        [Piece.MET]: MET_SHIFT,
        [Piece.RUA]: RUA_SHIFT,
        [Piece.KHUN]: KHUN_SHIFT,
    },
} as const
