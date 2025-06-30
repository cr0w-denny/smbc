import type { Meta, StoryObj } from "@storybook/react";
import { ApiDocsModal } from "../src/ApiDocsModal";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import "swagger-ui-react/swagger-ui.css";

const meta: Meta<typeof ApiDocsModal> = {
  title: "Components/ApiDocsModal",
  component: ApiDocsModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A modal component for displaying API documentation using Swagger UI with dark mode support.",
      },
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Controls whether the modal is open",
    },
    appletName: {
      control: "text",
      description: "Name of the applet/service for display",
    },
    isDarkMode: {
      control: "boolean",
      description: "Whether to apply dark mode styling to Swagger UI",
    },
    apiSpec: {
      control: "object",
      description: "OpenAPI/Swagger specification object",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample OpenAPI spec for demonstration
const sampleApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sample API",
    description: "A sample API for demonstration purposes",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://api.example.com/v1",
      description: "Production server",
    },
  ],
  paths: {
    "/users": {
      get: {
        summary: "Get users",
        description: "Retrieve a list of users",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create user",
        description: "Create a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateUser",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Get user by ID",
        description: "Retrieve a specific user by their ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "User ID",
          },
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "404": {
            description: "User not found",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "User ID",
          },
          name: {
            type: "string",
            description: "User name",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "When the user was created",
          },
        },
        required: ["id", "name", "email"],
      },
      CreateUser: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "User name",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
          },
        },
        required: ["name", "email"],
      },
    },
  },
};

export const Default: Story = {
  args: {
    open: true,
    appletName: "User Management",
    apiSpec: sampleApiSpec,
    isDarkMode: false,
    onClose: () => console.log("Modal closed"),
  },
};

export const DarkMode: Story = {
  args: {
    open: true,
    appletName: "User Management",
    apiSpec: sampleApiSpec,
    isDarkMode: true,
    onClose: () => console.log("Modal closed"),
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const NoApiSpec: Story = {
  args: {
    open: true,
    appletName: "Broken Applet",
    apiSpec: null,
    isDarkMode: false,
    onClose: () => console.log("Modal closed"),
  },
};
