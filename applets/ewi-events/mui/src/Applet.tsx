import React from "react";
import Events from "./components/Events";

export interface AppletProps {
  mountPath: string;
  children?: React.ReactNode;
}

export const Applet: React.FC<AppletProps> = () => {
  return <Events />;
};

export default Applet;
