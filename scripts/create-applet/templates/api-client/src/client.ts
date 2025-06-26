import { createApiClient } from '@smbc/react-openapi-client';
import type { paths } from './generated/types';

export const {{APPLET_CAMEL_CASE}}Client = createApiClient<paths>({
  baseUrl: '/api/{{APPLET_NAME}}',
});

export type {{APPLET_PASCAL_CASE}}Client = typeof {{APPLET_CAMEL_CASE}}Client;