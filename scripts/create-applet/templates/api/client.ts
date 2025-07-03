import { createApiClient } from "@smbc/applet-core";
import type { paths } from "./generated/types";

export const apiClient = createApiClient<paths>();