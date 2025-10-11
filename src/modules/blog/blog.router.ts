import { canAccess } from "../../middlewares/can-access";
import MagicRouter from "../../openapi/magic-router";
import {
  handleCreateBlog,
  handleDeleteBlog,
  handleGetBlogById,
  handleGetBlogs,
  handleUpdateBlog,
} from "./blog.controller";
import { createBlogSchema, getBlogsSchema, updateBlogSchema } from "./blog.schema";

export const BLOG_ROUTER_ROOT = "/api/blogs";

const blogRouter = new MagicRouter(BLOG_ROUTER_ROOT);

blogRouter.get(
  "/",
  {
    requestType: { query: getBlogsSchema },
  },
  canAccess(),
  handleGetBlogs,
);

blogRouter.post(
  "/",
  { requestType: { body: createBlogSchema } },
  canAccess(),
  handleCreateBlog,
);

blogRouter.get(
  "/:id",
  {},
  canAccess(),
  handleGetBlogById,
);

blogRouter.patch(
  "/:id",
  { requestType: { body: updateBlogSchema } },
  canAccess(),
  handleUpdateBlog,
);

blogRouter.delete(
  "/:id",
  {},
  canAccess(),
  handleDeleteBlog,
);

export default blogRouter.getRouter();
