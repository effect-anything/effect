const makeJestConfig = require("../../scripts/jest.bundler")
const babelConfigFile = require.resolve("../../scripts/pkg/babel.config.js")

module.exports = makeJestConfig(__dirname, {
  testEnvironment: "jsdom",
  transform: {
    "\\.[jt]sx?$": [
      "babel-jest",
      {
        configFile: babelConfigFile,
      },
    ],
  },
})
