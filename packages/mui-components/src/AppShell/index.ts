export type {
  AppShellProps,
  NavigationItem,
  TreeNavigationItem,
} from "./types";

export type { ToolbarProps } from "./components/Toolbar";
export type { PageProps } from "./components/Page";
export type { ContentProps } from "./components/Content";

import { Toolbar } from "./components/Toolbar";
import { Page } from "./components/Page";
import { Content } from "./components/Content";
import { Layout } from "./components/Layout";

export const AppShell = {
  Toolbar,
  Page,
  Content,
  Layout,
};
