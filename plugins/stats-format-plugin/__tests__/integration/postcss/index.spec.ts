import { webpackPromise } from "../index"
import MiniCssExtractPlugin from "@effect-x/deps/compiled/mini-css-extract-plugin"

describe("integration/postcss", () => {
  it("postcss error: Unknown word", async () => {
    const stats = await webpackPromise("./fixtures/postcss-error", {
      entry: "./unknown-word.css",
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[id].css",
        }),
      ],
      rules: [
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                implementation: require("postcss"),
                sourceMap: true,
                postcssOptions: {
                  plugins: {
                    autoprefixer: {
                      grid: true,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    })

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("postcss")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual(`Syntax Error`)
    expect(message.message).toEqual(`Unknown word`)
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/postcss-error/unknown-word.css"
    )
    expect(message.loc).toEqual({
      line: 4,
      column: 3,
    })
    expect(message.frame).toEqual(
      `\u001b[0m \u001b[90m 2 |\u001b[39m   display\u001b[33m:\u001b[39m grid\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 |\u001b[39m   grid\u001b[33m-\u001b[39mauto\u001b[33m-\u001b[39mflow\u001b[33m:\u001b[39m row\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 4 |\u001b[39m   \u001b[90m// syntax error\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   |\u001b[39m   \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 5 |\u001b[39m\u001b[0m`
    )
    expect(typeof message.stack).toBe("string")
  })

  it("postcss error: At-rule without name", async () => {
    const stats = await webpackPromise("./fixtures/postcss-error", {
      entry: "./at-rule-without-name.css",
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[id].css",
        }),
      ],
      rules: [
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                implementation: require("postcss"),
                sourceMap: true,
                postcssOptions: {
                  plugins: {
                    autoprefixer: {
                      grid: true,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    })

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("postcss")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual(`Syntax Error`)
    expect(message.message).toEqual(`At-rule without name`)
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/postcss-error/at-rule-without-name.css"
    )
    expect(message.loc).toEqual({
      line: 3,
      column: 5,
    })
    expect(message.frame).toEqual(
      `\u001b[0m \u001b[90m 1 |\u001b[39m \u001b[33m.\u001b[39mt1 {\u001b[0m\n\u001b[0m \u001b[90m 2 |\u001b[39m     color\u001b[33m:\u001b[39m blue\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 3 |\u001b[39m     \u001b[33m@\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   |\u001b[39m     \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m`
    )
    expect(typeof message.stack).toBe("string")
  })

  it("postcss error: Unclosed block", async () => {
    const stats = await webpackPromise("./fixtures/postcss-error", {
      entry: "./unclosed-block.css",
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[id].css",
        }),
      ],
      rules: [
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                implementation: require("postcss"),
                sourceMap: true,
                postcssOptions: {
                  plugins: {
                    autoprefixer: {
                      grid: true,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    })

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("postcss")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual(`Syntax Error`)
    expect(message.message).toEqual(`Unclosed block`)
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/postcss-error/unclosed-block.css"
    )
    expect(message.loc).toEqual({
      line: 1,
      column: 1,
    })
    expect(message.frame).toEqual(
      `\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 |\u001b[39m body {\u001b[0m\n\u001b[0m \u001b[90m   |\u001b[39m \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 2 |\u001b[39m   display\u001b[33m:\u001b[39m grid\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 |\u001b[39m   grid\u001b[33m-\u001b[39mauto\u001b[33m-\u001b[39mflow\u001b[33m:\u001b[39m row\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 4 |\u001b[39m\u001b[0m`
    )
    expect(typeof message.stack).toBe("string")
  })

  it("postcss error: plugin error", async () => {
    const stats = await webpackPromise("./fixtures/postcss-plugin-error", {
      entry: "./index.css",
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[id].css",
        }),
      ],
      rules: [
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                implementation: require("postcss"),
                sourceMap: true,
                postcssOptions: {
                  plugins: ["not found plugin"],
                },
              },
            },
          ],
        },
      ],
    })

    expect(stats.errors).toHaveLength(1)
    expect(stats.warnings).toHaveLength(0)

    const message = stats.errors![0]

    expect(message.severity).toEqual(10)
    expect(message.category).toEqual("postcss")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual(`PostCSS Error`)
    expect(message.message).toEqual(`Cannot find plugin: 'not found plugin'`)
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/postcss-plugin-error/index.css"
    )
    expect(message.loc).toEqual({
      line: 1,
      column: 1,
    })
    expect(message.frame).toEqual("")
    expect(typeof message.stack).toBe("string")
  })
})
