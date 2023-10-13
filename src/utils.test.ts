import { clone } from "ramda"

import { getAlgebraic, getFile, getRank, swapColor } from "./utils"
import { Color } from "./constants"

describe("utils", () => {
    describe("swapColor", () => {
        it.each`
            currentColor   | oppositeColor
            ${Color.WHITE} | ${Color.BLACK}
            ${Color.BLACK} | ${Color.WHITE}
        `("should swap color from $currentColor to $oppositeColor", ({ currentColor, oppositeColor }) => {
            expect(swapColor(currentColor)).toBe(oppositeColor)
        })
    })

    describe("rank", () => {
        it("should get rank number from square index", () => {
            for (let i = 0; i < 128; i++) {
                if (!(i & 0x88)) {
                    expect(getRank(i)).toBe(Math.floor(i / 16))
                }
            }
        })
    })


    describe("file", () => {
        it("should get file number from square index", () => {
            for (let i = 0; i < 128; i++) {
                if (!(i & 0x88)) {
                    expect(getFile(i)).toBe(i % 16)
                }
            }
        })
    })


    describe("getAlgebraic", () => {
        it("should represent square index with algebraic notation correctly", () => {
            for (let i = 0; i < 128; i++) {
                if (!(i & 0x88)) {
                    const _rank = Math.floor(i / 16)
                    const _file = i % 16

                    expect(getAlgebraic(i)).toBe("abcdefgh"[_file] + "12345678"[_rank])
                    expect(getAlgebraic(i, true)).toBe("กขคงจฉชญ"[_file] + "12345678"[_rank])
                }
            }
        })
    })


    describe("print board", () => {
        it("should print board state correctly", () => {
            // TODO
        })
    })
})
