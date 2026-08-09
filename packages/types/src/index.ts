import { z } from "zod";
import { MenuResponseSchema, type MenuResponse } from "./menu";

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
    })
    .optional(),
  meta: z.record(z.unknown()).optional(),
});

export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & {
  data?: T;
};

export const HealthResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "down"]),
  services: z.object({
    database: z.enum(["up", "down"]),
    redis: z.enum(["up", "down"]).optional(),
  }),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export { MenuResponseSchema, type MenuResponse };
