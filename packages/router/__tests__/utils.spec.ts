import { isRealEmpty, joinPath } from "../src/utils"

describe("utils.ts test", () => {
  describe("isRealEmpty", () => {
    it("null check", () => {
      expect(isRealEmpty(null)).toEqual(true)
    })

    it("undefined check", () => {
      expect(isRealEmpty(undefined)).toEqual(true)
    })

    it("empty string check", () => {
      expect(isRealEmpty("")).toEqual(true)
    })

    it("empty list check", () => {
      expect(isRealEmpty([])).toEqual(true)
    })

    it("empty object check", () => {
      expect(isRealEmpty({})).toEqual(true)
    })

    it("object check", () => {
      const example = [1, 2, 3]

      expect(isRealEmpty(example)).toEqual(false)
    })

    it("object check", () => {
      const example = { a: 1 }

      expect(isRealEmpty(example)).toEqual(false)
    })
  })

  describe("joinPath", () => {
    it("empty split", () => {
      const p = ["a", "a/"]

      expect(joinPath(...p)).toEqual("/a/a")
    })

    it("too much split", () => {
      const p = ["/a/", "/b/"]

      expect(joinPath(...p)).toEqual("/a/b")
    })

    it("pass", () => {
      const p = ["/a", "/b", "/c"]

      expect(joinPath(...p)).toEqual("/a/b/c")
    })

    it("repeat", () => {
      const p = ["/a/", "//b", "/c", "//d", "/e/"]

      expect(joinPath(...p)).toEqual("/a/b/c/d/e")
    })
  })
})
