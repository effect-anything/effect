import { webpackPromise } from "../index"

describe("integration/module-not-found", () => {
  it("entry-not-found", async () => {
    const stats = await webpackPromise("./NOT_FOUND")

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("webpack")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual("Module Not Found")
    expect(message.message).toEqual(`Can't resolve './index.js'`)
    expect(message.file).toEqual("")
    expect(message.loc).toEqual({
      line: 1,
      column: 1,
    })
    expect(message.frame).toEqual("")
    expect(message.stack).toEqual("")
  })

  it("module-not-found-errors", async () => {
    const stats = await webpackPromise("./fixtures/module-not-found-errors", {
      hasBabel: true,
      hasSourceMap: true,
    })

    expect(stats.errors).toHaveLength(3)
    expect(stats.warnings).toHaveLength(0)

    const [message1, message2, message3] = stats.errors!

    expect(message1.severity).toEqual(10)
    expect(message1.category).toEqual("webpack")
    expect(message1.type).toEqual("error")
    expect(message1.causes).toEqual(`Module Not Found`)
    expect(message1.message).toEqual(`Can't resolve 'not-found'`)
    expect(message1.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/module-not-found-errors/index.js"
    )
    expect(message1.loc).toEqual({
      line: 1,
      column: 1,
    })
    expect(message1.frame).toEqual(
      `\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 |\u001b[39m require(\u001b[32m'not-found'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 2 |\u001b[39m require(\u001b[32m'./non-existing'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 |\u001b[39m require(\u001b[32m'../non-existing'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 4 |\u001b[39m\u001b[0m`
    )
    expect(typeof message1.stack).toBe("string")

    // error2
    expect(message2.severity).toEqual(10)
    expect(message2.category).toEqual("webpack")
    expect(message2.type).toEqual("error")
    expect(message2.causes).toEqual(`Module Not Found`)
    expect(message2.message).toEqual(`Can't resolve './non-existing'`)
    expect(message2.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/module-not-found-errors/index.js"
    )
    expect(message2.loc).toEqual({
      line: 3,
      column: 1,
    })
    expect(message2.frame).toEqual(
      `\u001b[0m \u001b[90m 1 |\u001b[39m require(\u001b[32m'not-found'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 2 |\u001b[39m require(\u001b[32m'./non-existing'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 |\u001b[39m require(\u001b[32m'../non-existing'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 4 |\u001b[39m\u001b[0m`
    )
    expect(typeof message2.stack).toBe("string")

    // error3
    expect(message3.severity).toEqual(10)
    expect(message3.category).toEqual("webpack")
    expect(message3.type).toEqual("error")
    expect(message3.causes).toEqual(`Module Not Found`)
    expect(message3.message).toEqual(`Can't resolve '../non-existing'`)
    expect(message3.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/module-not-found-errors/index.js"
    )
    expect(message3.loc).toEqual({
      line: 5,
      column: 1,
    })
    expect(message3.frame).toEqual(
      `\u001b[0m \u001b[90m 1 |\u001b[39m require(\u001b[32m'not-found'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 2 |\u001b[39m require(\u001b[32m'./non-existing'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 3 |\u001b[39m require(\u001b[32m'../non-existing'\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 4 |\u001b[39m\u001b[0m`
    )
    expect(typeof message3.stack).toBe("string")
  })

  it("module-exports-error", async () => {
    const stats = await webpackPromise("./fixtures/module-exports-errors", {
      hasBabel: true,
    })

    expect(stats.errors).toHaveLength(0)
    expect(stats.warnings).toHaveLength(1)

    const message = stats.warnings![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("webpack")
    expect(message.type).toEqual("warning")
    expect(message.causes).toEqual(`Import Error`)
    expect(message.message).toEqual(
      `Attempted import error: '_NotFound' is not exported from './index-exports' (imported as '_NotFound').`
    )
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/module-exports-errors/index.js"
    )
    expect(message.loc).toEqual({
      line: 1,
      column: 1,
    })
    expect(message.frame).toEqual(
      `\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 |\u001b[39m \u001b[36mimport\u001b[39m { _NotFound } \u001b[36mfrom\u001b[39m \u001b[32m\"./index-exports\"\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 2 |\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 |\u001b[39m console\u001b[33m.\u001b[39mlog(_NotFound)\u001b[0m\n\u001b[0m \u001b[90m 4 |\u001b[39m\u001b[0m`
    )
    expect(typeof message.stack).toBe("string")
  })

  // xit("module-exports-error2", async () => {
  //   const stats = await webpackPromise("./fixtures/module-exports-errors", {
  //     entry: "./index2.js",
  //     hasBabel: true,
  //   })

  //   expect(stats.errors).toHaveLength(0)
  //   expect(stats.warnings).toHaveLength(1)

  //   const message = stats.warnings![0]

  //   expect(message.severity).toEqual(10)
  //   expect(message.category).toEqual("webpack")
  //   expect(message.type).toEqual("warning")
  //   expect(message.causes).toEqual(`Import Error`)
  //   expect(message.message).toEqual(
  //     `Attempted import error: '_NotFound' is not exported from './index2-exports' (imported as '_NotFound').`
  //   )
  //   expect(message.file).toEqual(
  //     "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/module-exports-errors/index2.js"
  //   )
  //   expect(message.loc).toEqual({
  //     line: 1,
  //     column: 1,
  //   })
  //   expect(message.frame).toEqual(
  //     `\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 |\u001b[39m \u001b[36mimport\u001b[39m { _NotFound } \u001b[36mfrom\u001b[39m \u001b[32m\"./index2-exports\"\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 2 |\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 |\u001b[39m console\u001b[33m.\u001b[39mlog(_NotFound)\u001b[0m\n\u001b[0m \u001b[90m 4 |\u001b[39m\u001b[0m`
  //   )
  //   expect(typeof message.stack).toBe("string")
  // })
})
