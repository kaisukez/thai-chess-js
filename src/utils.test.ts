import { algebraic, ascii, clone, compose, file, pipe, rank, swapColor } from "./utils"
import { Color } from "./constants/Piece"

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
                    expect(rank(i)).toBe(Math.floor(i / 16))
                }
            }
        })
    })


    describe("file", () => {
        it("should get file number from square index", () => {
            for (let i = 0; i < 128; i++) {
                if (!(i & 0x88)) {
                    expect(file(i)).toBe(i % 16)
                }
            }
        })
    })


    describe("algebraic", () => {
        it("should represent square index with algebraic notation correctly", () => {
            for (let i = 0; i < 128; i++) {
                if (!(i & 0x88)) {
                    const _rank = Math.floor(i / 16)
                    const _file = i % 16

                    expect(algebraic(i)).toBe("abcdefgh"[_file] + "12345678"[_rank])
                    expect(algebraic(i, { thai: true })).toBe("กขคงจฉชญ"[_file] + "12345678"[_rank])
                }
            }
        })
    })


    describe("ascii", () => {
        it("should print board state correctly", () => {
            // TODO
        })
    })


    describe("clone", () => {
        it("should deep clone nested array correctly", () => {
            const a: any = [11, 22, 33, [44, 55, [66, 77]]]
            const aCopy = clone(a)

            expect(aCopy).toEqual(a)
            expect(aCopy).not.toBe(a)

            expect(aCopy[3]).toEqual(a[3])
            expect(aCopy[3]).not.toBe(a[3])

            expect(aCopy[3][2]).toEqual(a[3][2])
            expect(aCopy[3][2]).not.toBe(a[3][2])
        })

        it("should deep clone nested object correctly", () => {
            const b = {
                firstName: "ffff",
                lastName: "llll",
                nested: {
                    nested: {
                        nested: {
                            nested: ["nnnn", "eee", "ss", "t", "ee", "ddd"],
                        },
                    },
                },
                null: null,
                undefined: undefined,
                emptyString: "",
            }
            const bCopy = clone(b)

            expect(bCopy).toEqual(b)
            expect(bCopy).not.toBe(b)

            expect(bCopy.nested).toEqual(b.nested)
            expect(bCopy.nested).not.toBe(b.nested)

            expect(bCopy.nested.nested).toEqual(b.nested.nested)
            expect(bCopy.nested.nested).not.toBe(b.nested.nested)

            expect(bCopy.nested.nested.nested).toEqual(b.nested.nested.nested)
            expect(bCopy.nested.nested.nested).not.toBe(b.nested.nested.nested)

            expect(bCopy.nested.nested.nested.nested).toEqual(b.nested.nested.nested.nested)
            expect(bCopy.nested.nested.nested.nested).not.toBe(b.nested.nested.nested.nested)
        })
    })


    describe("compose / pipe", () => {
        const plusOneThenDouble = (num: number) => (num + 1) * 2
        const minusTwoThenTriple = (num: number) => (num - 2) * 3

        it("compose execution order should go from bottom to top", () => {
            const result = compose(
                plusOneThenDouble,
                minusTwoThenTriple,
            )(1)

            expect(result).toBe(-4)
        })

        it("pipe execution order should go from top to bottom", () => {
            const result = pipe(
                plusOneThenDouble,
                minusTwoThenTriple,
            )(1)

            expect(result).toBe(6)
        })
    })
})
