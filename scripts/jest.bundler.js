const path = require("path");
const baseConfig = require("./jest.config.base");
const babelConfigFile = require.resolve("./bundler/babel.config.js");

/**
 * @param {string} cwd
 * @param {import('@jest/types').Config.InitialOptions} options
 * @returns {import('@jest/types').Config.InitialOptions}
 */
module.exports = (cwd, options) => {
  const pkg = path.join(cwd, "package.json");
  const packageDir = path.basename(path.resolve(cwd, ".."));
  const packageName = require(pkg).name.split("@effect-x/").pop();

  return {
    ...baseConfig,
    roots: [`<rootDir>/${packageDir}/${packageName}`],
    rootDir: "../../",
    name: packageName,
    displayName: packageName,
    transform: {
      "\\.[jt]s$": [
        "babel-jest",
        {
          configFile: babelConfigFile,
          caller: {
            env: "test",
          },
        },
      ],
    },
    ...options,
  };
};
