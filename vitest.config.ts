import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    testTimeout: 180000, // 180s global default for all test files
    fileParallelism: false // runs one test file at a time
  },
  resolve: {
    alias: {
      "@src": path.resolve("./src"),
      "@config": path.resolve("./config"),
      "@tests": path.resolve("./tests")
    }
  }
});