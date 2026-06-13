const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const tailwindcss = (await import("@tailwindcss/vite")).default;
    const { mergeConfig } = await import("vite");
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      esbuild: { target: "esnext" },
      build: { target: "esnext" },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src"),
        },
      },
    });
  },
};
