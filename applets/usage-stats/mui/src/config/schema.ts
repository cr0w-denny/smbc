import { z } from "zod";

// Base schema for date range queries
export const DateRangeSchema = z.object({
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
});

// Users usage query schema
export const UsersUsageQuerySchema = DateRangeSchema.extend({
  ui_filter: z.string().optional(),
});

// UI usage query schema  
export const UIUsageQuerySchema = DateRangeSchema.extend({
  user_email: z.string().email().optional(),
});

// Exceptions query schema
export const ExceptionsQuerySchema = DateRangeSchema;

// Response schemas
export const UsageStatsUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  count: z.number().int(),
});

export const UsageStatsComponentSchema = z.object({
  component: z.string(),
  count: z.number().int(),
});

export const UsageStatsExceptionSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  count: z.number().int(),
});

export const UsageStatsListSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    component_map: z.record(z.string(), z.string()),
    records: z.array(itemSchema),
  });

// Export types
export type DateRangeQuery = z.infer<typeof DateRangeSchema>;
export type UsersUsageQuery = z.infer<typeof UsersUsageQuerySchema>;
export type UIUsageQuery = z.infer<typeof UIUsageQuerySchema>;
export type ExceptionsQuery = z.infer<typeof ExceptionsQuerySchema>;
export type UsageStatsUser = z.infer<typeof UsageStatsUserSchema>;
export type UsageStatsComponent = z.infer<typeof UsageStatsComponentSchema>;
export type UsageStatsException = z.infer<typeof UsageStatsExceptionSchema>;

// Schema configuration function
export const createSchemaConfig = () => ({
  validation: {
    query: UsersUsageQuerySchema, // Default to users query schema
  },
  types: {
    user: UsageStatsUserSchema,
    component: UsageStatsComponentSchema,
    exception: UsageStatsExceptionSchema,
  },
});