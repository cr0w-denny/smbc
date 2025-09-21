import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

const theme = create({
  base: "dark",
  brandTitle: "SMBC Component Library",
  brandUrl: "../",
  brandImage: "./logo-dark.png",
  brandTarget: "_self",
});

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
  },
});

// Hide the addons panel by default
addons.register('hide-panel', (api) => {
  api.togglePanel(false);
});
