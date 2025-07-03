import { createApiClient } from "@smbc/applet-core";
import type { paths } from "./generated/types";

// Default client instance
export const apiClient = createApiClient<paths>();