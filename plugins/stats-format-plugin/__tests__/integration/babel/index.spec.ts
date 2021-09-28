import { webpackPromise } from "../index"

describe("integration/babel", () => {
  it("success", async () => {
    const stats = await webpackPromise("./fixtures/success")

    expect(stats.errors).toHaveLength(0)
    expect(stats.warnings).toHaveLength(0)
  })

  it("babel syntax error", async () => {
    const stats = await webpackPromise("./fixtures/babel-syntax-error", {
      hasBabel: true,
    })

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("babel")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual("Syntax Error")
    expect(message.message).toEqual(`Unexpected token, expected "{"`)
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/babel-syntax-error/index.js"
    )
    expect(message.loc).toEqual({
      line: 4,
      column: 4,
    })
    expect(typeof message.frame).toBe("string")
    expect(typeof message.stack).toBe("string")
  })

  it("babel syntax error with missing config", async () => {
    const stats = await webpackPromise("./fixtures/babel-syntax-error-missing-config", {
      hasBabel: true,
    })

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("babel")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual("Syntax Error")
    expect(message.message).toEqual(
      `Support for the experimental syntax 'jsx' isn't currently enabled\nAdd @babel/preset-react (https://git.io/JfeDR) to the 'presets' section of your Babel config to enable transformation.\nIf you want to leave it as-is, add @babel/plugin-syntax-jsx (https://git.io/vb4yA) to the 'plugins' section to enable parsing.`
    )
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/babel-syntax-error-missing-config/index.js"
    )
    expect(message.loc).toEqual({
      line: 4,
      column: 12,
    })
    expect(typeof message.frame).toBe("string")
    expect(typeof message.stack).toBe("string")
  })

  it("babel syntax error with jsx", async () => {
    const stats = await webpackPromise("./fixtures/babel-syntax-error-jsx", {
      hasBabel: true,
      hasJsx: true,
    })

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("babel")
    expect(message.type).toEqual("error")
    expect(message.category).toEqual("babel")
    expect(message.type).toEqual("error")
    expect(message.severity).toEqual(10)
    expect(message.causes).toEqual(`Syntax Error`)
    expect(message.message).toEqual(`Unterminated JSX contents.`)
    expect(message.file).toEqual(
      `/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/babel-syntax-error-jsx/index.js`
    )
    expect(message.loc).toEqual({
      line: 4,
      column: 16,
    })
    expect(typeof message.frame).toBe("string")
    expect(typeof message.stack).toBe("string")
  })

  it("babel syntax error with unknown options", async () => {
    const stats = await webpackPromise("./fixtures/babel-syntax-error-unknown-options", {
      hasBabel: true,
      babelOptions: {
        "some-unknown-option": true,
      },
    })

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("babel")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual("Unknown Option")
    expect(message.message).toEqual(
      `.some-unknown-option. Check out https://babeljs.io/docs/en/babel-core/#options for more information about options.`
    )
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/babel-syntax-error-unknown-options/index.js"
    )
    expect(message.loc).toEqual({
      line: 1,
      column: 1,
    })
    expect(typeof message.frame).toBe("string")
    expect(typeof message.stack).toBe("string")
  })
})
