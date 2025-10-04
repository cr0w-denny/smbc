import React, { createContext, useContext } from "react";

// Known config shape (but applets can add anything)
export interface KnownConfig {
  /** Form field configuration */
  form?: {
    /** Label positioning mode - 'contain' keeps label within border, 'overlap' allows floating label to overlap border */
    labelMode?: "contain" | "overlap";
  };
  /** Toolbar configuration */
  toolbar?: {
    mode?: "light" | "dark";
  };
}

// Allow any keys, but provide types for known ones
export type Config = KnownConfig & Record<string, any>;

const ConfigContext = createContext<Config | undefined>(undefined);

export const ConfigProvider: React.FC<{
  config?: Config;
  children: React.ReactNode;
}> = ({ config, children }) => {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = (): Config => {
  const context = useContext(ConfigContext);
  return context || {};
};
