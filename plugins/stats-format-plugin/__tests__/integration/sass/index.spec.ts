import { webpackPromise } from "../index"
import MiniCssExtractPlugin from "@effect-x/deps/compiled/mini-css-extract-plugin"

describe("integration/sass", () => {
  it("sass error", async () => {
    const stats = await webpackPromise("./fixtures/sass-syntax-error", {
      entry: "./index.scss",
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[id].css",
        }),
      ],
      rules: [
        {
          test: /\.scss$/,
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
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
                sourceMap: true,
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
    expect(message.category).toEqual("sass")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual(`Syntax Error`)
    expect(message.message).toEqual(`Expected digit`)
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/sass-syntax-error/index.scss"
    )
    expect(message.loc).toEqual({
      line: 5,
      column: 24,
    })
    expect(message.frame).toEqual(
      `\u001b[0m \u001b[90m 3 |\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 4 |\u001b[39m   \u001b[33m.\u001b[39mcontainer {\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 5 |\u001b[39m     margin\u001b[33m-\u001b[39mtop\u001b[33m:\u001b[39m \u001b[35m100\u001b[39mpx \u001b[33m.\u001b[39mtest {\u001b[0m\n\u001b[0m \u001b[90m   |\u001b[39m                        \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 6 |\u001b[39m       vertical\u001b[33m-\u001b[39malign\u001b[33m:\u001b[39m middle\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 7 |\u001b[39m     }\u001b[0m\n\u001b[0m \u001b[90m 8 |\u001b[39m   }\u001b[0m`
    )
    expect(typeof message.stack).toBe("string")
  })

  it("postcss/sass error", async () => {
    const stats = await webpackPromise("./fixtures/sass-postcss-syntax-error", {
      entry: "./index.scss",
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[id].css",
        }),
      ],
      rules: [
        {
          test: /\.(s*)css$/,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                importLoaders: 2,
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
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
                sourceMap: true,
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
    expect(message.category).toEqual("sass")
    expect(message.type).toEqual("error")
    expect(message.causes).toEqual(`Syntax Error`)
    expect(message.message).toEqual(`expected "}"`)
    expect(message.file).toEqual(
      "/Users/kee/Workspace/effect-x/effect/plugins/stats-format-plugin/__tests__/integration/fixtures/sass-postcss-syntax-error/index.scss"
    )
    expect(message.loc).toEqual({
      line: 2,
      column: 14,
    })
    expect(message.frame).toEqual(
      `\u001b[0m \u001b[90m 1 |\u001b[39m body {\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 2 |\u001b[39m   color\u001b[33m:\u001b[39m red\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   |\u001b[39m              \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 3 |\u001b[39m\u001b[0m`
    )
    expect(typeof message.stack).toBe("string")
  })
})
