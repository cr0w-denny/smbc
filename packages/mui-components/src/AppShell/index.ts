export type {
  AppShellProps,
  NavigationItem,
  TreeNavigationItem,
} from "./types";

export type { ToolbarProps } from "./components/Toolbar";
export type { PageProps } from "./components/Page";

import { Toolbar } from "./components/Toolbar";
import { Page } from "./components/Page";
import { Layout } from "./components/Layout";

export const AppShell = {
  Toolbar,
  Page,
  Layout,
};
