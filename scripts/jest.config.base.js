let ignored = [
  "<rootDir>/bundler/deps/compiled",
  "<rootDir>/bundler/deps/bundles",
  "<rootDir>/packages/*/privates",
];

module.exports = {
  testEnvironment: "node",
  rootDir: "../..",
  roots: [`<rootDir>`],
  projects: [
    "<rootDir>/plugins/*",
    "<rootDir>/packages/*",
    "<rootDir>/bundler/*",
  ],
  moduleDirectories: ["node_modules"],
  modulePaths: ["node_modules"],
  testMatch: ["!**/__fixtures__/**", "**/__tests__/**/*.(spec|test).[t]s?(x)"],
  modulePathIgnorePatterns: [...ignored],
  testPathIgnorePatterns: [...ignored],
  transformIgnorePatterns: [...ignored],
  watchPathIgnorePatterns: [...ignored],
  coveragePathIgnorePatterns: [...ignored],
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "packages/**/src/**/*.ts",
    "bundler/**/src/**/*.ts",
    "plugins/**/src/**/*.ts",
  ],
  setupFiles: [
    `<rootDir>/scripts/jest-polyfills.ts`,
    `<rootDir>/scripts/jest-setup.ts`,
  ],
  setupFilesAfterEnv: [`<rootDir>/scripts/jest-setup-after-env.ts`],
  transform: {
    "\\.[jt]sx?$": [
      "babel-jest",
      {
        configFile: require.resolve("./bundler/babel.config.js"),
        caller: {
          env: "test",
        },
      },
    ],
  },
};
