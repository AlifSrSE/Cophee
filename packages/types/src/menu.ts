import { z } from "zod";

export const MenuResponseSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      products: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          price: z.number(),
          imageKey: z.string().optional(),
        })
      ),
    })
  ),
});

export type MenuResponse = z.infer<typeof MenuResponseSchema>;
