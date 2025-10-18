import { z } from "zod";
import { R } from "../../openapi/response.builders";
import { blogOutSchema } from "./blog.dto";

export const createBlogSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1),
  description: z.string().optional(),
});

export const updateBlogSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const getBlogsSchema = z.object({
  searchString: z.string().optional(),
  limitParam: z
    .string()
    .default("10")
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) >= 0,
      "Input must be positive integer",
    )
    .transform(Number),
  pageParam: z
    .string()
    .default("1")
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) >= 0,
      "Input must be positive integer",
    )
    .transform(Number),
});

export type CreateBlogSchemaType = z.infer<typeof createBlogSchema>;
export type UpdateBlogSchemaType = z.infer<typeof updateBlogSchema>;
export type GetBlogsSchemaType = z.infer<typeof getBlogsSchema>;

// Response schemas
export const createBlogResponseSchema = R.success(blogOutSchema);
export const getBlogsResponseSchema = R.paginated(blogOutSchema);
export const getBlogByIdResponseSchema = R.success(blogOutSchema);
export const updateBlogResponseSchema = R.success(blogOutSchema);

// Response types
export type CreateBlogResponseSchema = z.infer<typeof createBlogResponseSchema>;
export type GetBlogsResponseSchema = z.infer<typeof getBlogsResponseSchema>;
export type GetBlogByIdResponseSchema = z.infer<typeof getBlogByIdResponseSchema>;
export type UpdateBlogResponseSchema = z.infer<typeof updateBlogResponseSchema>;
