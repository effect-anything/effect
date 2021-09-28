import { extract, defaultExtract, ExtractError } from "../../src/core/extractError"
import { transforms, Transformer } from "../../src/core/transformErrors"

describe("core/transformErrors.ts", () => {
  it("default", () => {
    const error = new Error("Some Error")
    const extractErrors = defaultExtract(error)

    const mockTransform = jest.fn((e) => e)

    const transform: Transformer<any> = {
      transform: mockTransform,
    }

    const result = transforms([transform])(extractErrors)

    expect(mockTransform).toBeCalledTimes(1)

    expect(result).toEqual([
      {
        severity: undefined,
        category: undefined,
        type: "error",
        message: "Some Error",
        causes: undefined,
        file: undefined,
        loc: undefined,
        frame: undefined,
        stack: error.stack,
      },
    ] as ExtractError[])
  })

  it("custom extract", () => {
    const mockExtract = jest.fn().mockImplementation((error: Error) => {
      return {
        severity: 10,
        category: "MOCK CATEGORY",
        type: "error",
        message: error.message,
        causes: "MOCK",
        file: "MOCK",
        loc: {
          line: 10,
          column: 10,
        },
        frame: "MOCK",
        stack: error.stack,
      } as ExtractError
    })

    const error = new Error("Some Error")
    const extractErrors = extract(mockExtract, [error])

    const mockTransform = jest.fn((e) => e)

    const transform: Transformer<any> = {
      transform: mockTransform,
    }

    const result = transforms([transform])(extractErrors)

    expect(mockExtract).toBeCalledTimes(1)
    expect(mockTransform).toBeCalledTimes(1)

    expect(result).toEqual([
      {
        severity: 10,
        category: "MOCK CATEGORY",
        type: "error",
        message: "Some Error",
        causes: "MOCK",
        file: "MOCK",
        loc: {
          line: 10,
          column: 10,
        },
        frame: "MOCK",
        stack: error.stack,
      },
    ] as ExtractError[])
  })

  it("custom transform", () => {
    const error = new Error("Some Error")
    const extractErrors = defaultExtract(error)

    const mockTransform = jest.fn((e) => {
      return {
        severity: 10,
        category: "MOCK",
        type: "error",
        message: e.message,
        causes: "MOCK",
        file: "MOCK",
        loc: {
          line: 10,
          column: 10,
        },
        frame: "MOCK",
        stack: "MOCK",
      } as ExtractError
    })

    const transform: Transformer<any> = {
      transform: mockTransform,
    }

    const result = transforms([transform])(extractErrors)

    expect(mockTransform).toBeCalledTimes(1)

    expect(result).toEqual([
      {
        severity: 10,
        category: "MOCK",
        type: "error",
        message: "Some Error",
        causes: "MOCK",
        file: "MOCK",
        loc: {
          line: 10,
          column: 10,
        },
        frame: "MOCK",
        stack: "MOCK",
      },
    ] as ExtractError[])
  })

  it("multiple transforms", () => {
    const error = new Error("Some Error")
    const extractErrors = defaultExtract(error)

    const mockTransform1 = jest.fn((e) => {
      return {
        ...e,
        severity: 10,
        causes: "MOCK",
        file: "MOCK",
        loc: {
          line: 10,
          column: 10,
        },
      } as ExtractError
    })

    const transform1: Transformer = {
      transform: mockTransform1,
    }

    const mockTransform2 = jest.fn((e) => {
      return {
        ...e,
        category: "MOCK",
        file: "MOCK2",
        loc: {
          line: 20,
          column: 20,
        },
      } as ExtractError
    })

    const transform2: Transformer = {
      transform: mockTransform2,
    }

    const result = transforms([transform1, transform2])(extractErrors)

    expect(result).toEqual([
      {
        severity: 10,
        category: "MOCK",
        type: "error",
        message: "Some Error",
        causes: "MOCK",
        file: "MOCK2",
        loc: {
          line: 20,
          column: 20,
        },
        frame: undefined,
        stack: error.stack,
      },
    ] as ExtractError[])
  })
})
