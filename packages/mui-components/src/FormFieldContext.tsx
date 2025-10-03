import React, { createContext, useContext } from "react";

export interface FormFieldConfig {
  /** Label positioning mode - 'contain' keeps label within border, 'overlap' allows floating label to overlap border */
  labelMode?: "contain" | "overlap";
}

const FormFieldContext = createContext<FormFieldConfig | undefined>(undefined);

export const FormFieldProvider: React.FC<{
  config?: FormFieldConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  return (
    <FormFieldContext.Provider value={config}>{children}</FormFieldContext.Provider>
  );
};

export const useFormField = (): FormFieldConfig => {
  const context = useContext(FormFieldContext);
  return context || {};
};
