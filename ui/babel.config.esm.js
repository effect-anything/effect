module.exports = {
  presets: [
    [
      require("@effect-x/presets/babel-preset").default,
      {
        hasReactRefresh: false,
        hasJsxRuntime: false,
        presetEnv: {
          useBuiltIns: "usage",
          modules: false,
          bugfixes: true,
        },
        transformRuntime: {
          absoluteRuntime: undefined,
          version: require("@babel/runtime/package.json").version,
          useESModules: true,
          regenerator: true,
          helpers: true,
        },
      },
    ],
  ],
  plugins: [
    [
      "babel-plugin-styled-components",
      {
        topLevelImportPaths: [
          "@xstyled/styled-components",
          "@xstyled/styled-components/no-tags",
          "@xstyled/styled-components/native",
          "@xstyled/styled-components/primitives",
        ],
      },
    ],
  ],
}
