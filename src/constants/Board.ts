// https://www.chessprogramming.org/0x88
// @formatter:off

// @formatter:off
export enum SquareIndex {
    a8 = 112, b8 = 113, c8 = 114, d8 = 115, e8 = 116, f8 = 117, g8 = 118, h8 = 119,
    a7 =  96, b7 =  97, c7 =  98, d7 =  99, e7 = 100, f7 = 101, g7 = 102, h7 = 103,
    a6 =  80, b6 =  81, c6 =  82, d6 =  83, e6 =  84, f6 =  85, g6 =  86, h6 =  87,
    a5 =  64, b5 =  65, c5 =  66, d5 =  67, e5 =  68, f5 =  69, g5 =  70, h5 =  71,
    a4 =  48, b4 =  49, c4 =  50, d4 =  51, e4 =  52, f4 =  53, g4 =  54, h4 =  55,
    a3 =  32, b3 =  33, c3 =  34, d3 =  35, e3 =  36, f3 =  37, g3 =  38, h3 =  39,
    a2 =  16, b2 =  17, c2 =  18, d2 =  19, e2 =  20, f2 =  21, g2 =  22, h2 =  23,
    a1 =   0, b1 =   1, c1 =   2, d1 =   3, e1 =   4, f1 =   5, g1 =   6, h1 =   7,
}
// @formatter:on

export const RANK_1 = 0
export const RANK_2 = 1
export const RANK_3 = 2
export const RANK_4 = 3
export const RANK_5 = 4
export const RANK_6 = 5
export const RANK_7 = 6
export const RANK_8 = 7

export const FILE_A = 0
export const FILE_B = 1
export const FILE_C = 2
export const FILE_D = 3
export const FILE_E = 4
export const FILE_F = 5
export const FILE_G = 6
export const FILE_H = 7

export const INITIAL_FEN = "rmtektmr/8/bbbbbbbb/8/8/BBBBBBBB/8/RMTKETMR w 1"
export const EMPTY_FEN = "k7/8/8/8/8/8/8/7K w 1"

export enum CountType {
    PIECE_POWER_COUNTDOWN = "pp",
    BOARD_POWER_COUNTDOWN = "bp",
}
