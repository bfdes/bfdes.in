export default {
  collectCoverageFrom: ["<rootDir>/src/**/*"],
  coverageProvider: "v8",
  moduleDirectories: ["<rootDir>", "node_modules"],
  transform: {
    "\\.(webmanifest|css|webp|jpg|jpeg|png|svg|ico|ttf|woff|woff2)$":
      "<rootDir>/jest/assetTransformer.js",
    "\\.js$": "@swc/jest",
  },
  transformIgnorePatterns: [],
};
