import React from "react";
import Dashboard from "./components/Dashboard";

export interface AppletProps {
  mountPath: string;
  children?: React.ReactNode;
}

export const Applet: React.FC<AppletProps> = () => {
  return <Dashboard />;
};

export default Applet;