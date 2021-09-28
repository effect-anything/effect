module.exports = {
  presets: [
    [
      require("@effect-x/presets/babel-preset").default,
      {
        hasReactRefresh: false,
        hasJsxRuntime: false,
        presetEnv: {
          modules: "commonjs",
          useBuiltIns: "usage",
          targets: "node 14",
        },
        transformRuntime: {
          absoluteRuntime: undefined,
          useESModules: false,
          helpers: true,
        },
      },
    ],
  ],
};
