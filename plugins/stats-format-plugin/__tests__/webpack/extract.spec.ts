import { ExtractError } from "../../src/core/extractError"
import { webpackErrorExtract, WebpackStatsError } from "../../src/webpack/extract"

describe("webpack/extract.ts", () => {
  it("should work", () => {
    const mockCtx = {}

    const extract = webpackErrorExtract("error", mockCtx)

    const error = {
      message: "MOCK MESSAGE",
      module: "MOCK",
      stack: "MOCK STACK",
      file: "MOCK FILE",
      loc: {
        line: 10,
        column: 10,
      },
      chunkId: "MOCK CHUNK ID",
      chunkInitial: "MOCK.CHUNK INITIAL",
      chunkName: "MOCK.CHUNK NAME",
      chunkEntry: "MOCK.CHUNK ENTRY",
      moduleId: "MOCK.MODULE ID",
      moduleIdentifier: "MOCK.MODULE IDENTIFIER",
      moduleName: "MOCK.MODULE NAME",
      moduleTrace: "error.MODULE TRACE",
      details: "MOCK.DETAILS",
    }

    const result = extract([error])

    expect(result).toEqual([
      {
        severity: 10,
        category: "webpack",
        type: "error",
        // default empty string
        causes: "",
        message: error.message,
        file: error.file,
        loc: {
          line: 10,
          column: 10,
        },
        frame: "",
        stack: error.stack,
        originError: error,
      },
    ] as unknown as ExtractError<WebpackStatsError>[])
  })
})
