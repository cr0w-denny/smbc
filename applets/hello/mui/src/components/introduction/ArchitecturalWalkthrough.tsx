import React, { useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
} from "@mui/material";
import {
  Step1_DefineAPI,
  Step2_DefinePermissions,
  Step3_ComponentStructure,
  Step4_DataViews,
  Step5_HostIntegration,
} from "../walkthrough";

export const ArchitecturalWalkthrough: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const steps = [
    {
      label: "1. Define the API Contract",
      content: <Step1_DefineAPI />,
    },
    {
      label: "2. Define Permissions",
      content: <Step2_DefinePermissions />,
    },
    {
      label: "3. Create Component Structure",
      content: <Step3_ComponentStructure />,
    },
    {
      label: "4. Implement Data Views",
      content: <Step4_DataViews />,
    },
    {
      label: "5. Host Integration",
      content: <Step5_HostIntegration />,
    },
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Building an Applet: From Concept to Production
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, maxWidth: "800px" }}>
        This walkthrough demonstrates how all architectural principles work
        together in practice. We'll build a simple Employee Directory applet,
        showing how each step reinforces the core concepts.
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="h6">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              {step.content}
              <Box sx={{ mb: 2, mt: 3 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? "Finish" : "Continue"}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Architecture in Action
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This walkthrough demonstrated all four architectural principles
            working together:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <strong>Standard Interface:</strong> Same export pattern enables
              any host integration
            </li>
            <li>
              <strong>Permission-Based Access:</strong> Security woven
              throughout the development process
            </li>
            <li>
              <strong>Hash-Based Navigation:</strong> Deep linking and state
              persistence built-in
            </li>
            <li>
              <strong>API-First Design:</strong> Contract-driven development
              enables parallel work
            </li>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            The result is a modular, secure, and maintainable business
            application that integrates seamlessly into any host system.
          </Typography>
          <Button onClick={handleReset} sx={{ mt: 2 }}>
            Reset Walkthrough
          </Button>
        </Paper>
      )}
    </Box>
  );
};
