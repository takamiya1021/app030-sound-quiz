import { defineConfig } from "@playwright/test";

const port = process.env.PORT ? Number(process.env.PORT) : 3110;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    actionTimeout: 0,
    baseURL: `http://127.0.0.1:${port}`,
    trace: "off",
    headless: true,
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
