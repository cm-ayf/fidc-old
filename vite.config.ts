import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import wellKnown from "./plugins/well-known";

export default defineConfig(({ mode }) => ({
  plugins: [sveltekit(), wellKnown({ mode })],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
}));
