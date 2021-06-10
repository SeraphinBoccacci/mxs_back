module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 30000,
  rootDir: "./src",
  coverageThreshold: {
    global: {
      // TO-DO increase this threshold by the time
      branches: 50,
      functions: 45,
      lines: 60,
      // statements: -10,
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/config/",
    "/models/",
    "/types/",
  ],
};
