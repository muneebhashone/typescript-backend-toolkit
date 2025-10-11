import { z } from "zod";
import { definePaginatedResponse } from "../../common/common.utils";

export const blogOutSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const blogSchema = blogOutSchema.extend({
  // Add internal fields here
});

export const blogsPaginatedSchema = definePaginatedResponse(blogOutSchema);

export type BlogModelType = z.infer<typeof blogSchema>;
export type BlogType = z.infer<typeof blogSchema> & { id: string; _id: string };
export type BlogPaginatedType = z.infer<typeof blogsPaginatedSchema>;
