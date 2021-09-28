require("./eslint-patch")

const prettierConfig = require("@effect-x/prettier-config")

module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: "module",
    requireConfigFile: false,
    babelOptions: {
      cloneInputAst: false,
      compact: false,
      sourceType: "unambiguous",
      presets: [
        [
          require("@effect-x/presets/babel-preset-node").default,
          {
            env: "production",
            hasReactRefresh: false,
            hasJsxRuntime: false,
            transformRuntime: undefined,
            presetEnv: {
              modules: "commonjs",
              targets: "node 12",
            },
          },
        ],
      ],
    },
  },
  plugins: ["prettier"],
  extends: [
    "eslint:recommended",
    "standard",
    "prettier",
    "plugin:import/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "prettier"],
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "standard",
        "prettier",
        "plugin:import/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
      ],
      rules: {
        "no-use-before-define": "off",
        "no-useless-constructor": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars-experimental": ["warn", { ignoredNamesRegex: "^_" }],
        camelcase: "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/interface-name-prefix": "off",
      },
      settings: {
        "import/extensions": [".js", ".jsx", ".ts", ".tsx", ".mjs", ".json"],
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
          node: {
            extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".json"],
          },
          alias: {},
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
    },
  ],
  settings: {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx", ".mjs", ".json"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".json"],
      },
      alias: {},
    },
  },
  rules: {
    "prettier/prettier": ["error", prettierConfig],
    semi: ["error", "never"],
    "no-useless-constructor": "off",
    "no-unused-vars": ["warn", { vars: "all", args: "all", argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "import/namespace": ["error", { allowComputed: true }],
    camelcase: "off",
  },
  globals: {
    global: "readonly",
  },
}
