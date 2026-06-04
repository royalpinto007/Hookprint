import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: "line",
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
    headless: true,
    baseURL: "http://127.0.0.1:3001",
  },
});
