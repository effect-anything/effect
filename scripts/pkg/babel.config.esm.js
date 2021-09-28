module.exports = {
  presets: [
    [
      require("@effect-x/presets/babel-preset").default,
      {
        hasReactRefresh: false,
        hasJsxRuntime: false,
        presetEnv: {
          modules: false,
        },
        transformRuntime: {
          absoluteRuntime: undefined,
          useESModules: true,
          helpers: true,
        },
      },
    ],
  ],
};
