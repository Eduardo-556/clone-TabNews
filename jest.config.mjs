import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });
const nextJest = (await import("next/jest.js")).default;

const createJestConfig = nextJest({
  dir: ".",
});
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
  transformIgnorePatterns: ["/node_modules/(?!(node-pg-migrate)/)"],
  testEnvironment: "node",
  transform: {},
});

export default jestConfig;
