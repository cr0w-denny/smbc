import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { cssVarTheme } from "./index";
import { ui } from "./tokens-proxy";
import { applyTokenOverrides, setThemeMode } from "./utils";
import "./tokens.css";

// Example component using the theme
function DemoComponent() {
  // This shows the beautiful syntax we'd have:
  const handleOverrideToken = () => {
    // Sweet syntax for token overrides - IDE autocomplete works!
    applyTokenOverrides({
      // These would have full IDE autocomplete:
      "ui.input.base.default.background": "#ff0000",
      "ui.color.text.primary": "#00ff00",
      "ui.card.base.default.borderColor": "#0000ff",
    });
  };

  const toggleMode = () => {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    setThemeMode(!isDark);
  };

  const showCssVars = () => {
    console.log("CSS Variable mode (property access):");
    console.log("Background:", String(ui.input.base.default.background)); // "var(--ui-input-base-default-background)"
    console.log("Border:", String(ui.input.base.default.borderColor)); // "var(--ui-input-base-default-borderColor)"
    console.log("Text:", String(ui.color.text.primary)); // "var(--ui-color-text-primary)"
  };

  const showValues = () => {
    console.log("Value mode (function calls):");
    console.log("Background (base):", ui.input.base.default.background()); // "#ffffff"
    console.log("Background (dark):", ui.input.base.default.background(true)); // "#1e1e1e" (mock)
    console.log("Border (base):", ui.input.base.default.borderColor()); // "#e0e0e0"
    console.log("Text (base):", ui.color.text.primary()); // "#212121"
    console.log("Text (dark):", ui.color.text.primary(true)); // "#ffffff" (mock)
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Sweet Token Syntax Demo
      </Typography>

      <Card style={{ marginBottom: "20px" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Controls
          </Typography>
          <Button
            onClick={handleOverrideToken}
            variant="contained"
            style={{ marginRight: "10px" }}
          >
            Override Tokens (Red inputs!)
          </Button>
          <Button
            onClick={toggleMode}
            variant="outlined"
            style={{ marginRight: "10px" }}
          >
            Toggle Dark/Light
          </Button>
          <Button
            onClick={showCssVars}
            variant="outlined"
            style={{ marginRight: "10px" }}
          >
            Show CSS Vars (Console)
          </Button>
          <Button onClick={showValues} variant="outlined">
            Show Resolved Values (Console)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sample Components
          </Typography>
          <TextField
            label="This input uses token variables"
            variant="outlined"
            fullWidth
            style={{ marginBottom: "16px" }}
            placeholder="Type something..."
          />
          <TextField
            label="Another input"
            variant="outlined"
            fullWidth
            style={{ marginBottom: "16px" }}
            placeholder="Placeholder text..."
          />
          <Button variant="contained">Button with theme colors</Button>
        </CardContent>
      </Card>

      <Card style={{ marginTop: "20px" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Code Examples
          </Typography>
          <Typography
            variant="body2"
            component="pre"
            style={{
              backgroundColor: "#f5f5f5",
              padding: "16px",
              fontSize: "12px",
            }}
          >
            {`// Perfect syntax examples:

// In palette.ts (property access = CSS variables):
primary: {
  main: ui.color.brand.primary,              // toString() → "var(--ui-color-brand-primary)"
  contrastText: ui.color.brand.primaryContrast,
},

// In components.ts (property access = CSS variables):
backgroundColor: ui.input.base.default.background,   // toString() → CSS variable
borderColor: ui.input.base.default.borderColor,
color: ui.color.text.primary,

// Get actual values when needed (function calls):
const lightBg = ui.input.base.default.background();     // "#ffffff"
const darkBg = ui.input.base.default.background(true);  // "#1e1e1e"
const themeBg = ui.input.base.default.background(theme); // Extracts from theme

// Dynamic token updates:
applyTokenOverrides({
  'ui.input.base.default.background': '#ff0000',   // IDE autocomplete!
  'ui.color.text.primary': '#00ff00'
});

// Property access = CSS variable, function call = resolved value:
String(ui.input.base.default.background)     // "var(--ui-input-base-default-background)"
ui.input.base.default.background()           // "#ffffff"
ui.input.base.default.background(true)       // "#1e1e1e"`}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

// Export the demo wrapped in the theme
export function SimplerThemeDemo() {
  return (
    <ThemeProvider theme={cssVarTheme}>
      <DemoComponent />
    </ThemeProvider>
  );
}
