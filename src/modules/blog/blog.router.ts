import { mongoIdSchema } from '../../common/common.schema';
import { canAccess } from '../../middlewares/can-access';
import MagicRouter from '../../openapi/magic-router';
import { R } from '../../openapi/response.builders';
import {
  handleCreateBlog,
  handleDeleteBlog,
  handleGetBlogById,
  handleGetBlogs,
  handleUpdateBlog,
} from './blog.controller';
import { blogOutSchema } from './blog.dto';
import {
  createBlogSchema,
  getBlogsSchema,
  updateBlogSchema,
} from './blog.schema';

export const BLOG_ROUTER_ROOT = '/blogs';

const blogRouter = new MagicRouter(BLOG_ROUTER_ROOT);

// List blogs with pagination (using new response system)
blogRouter.get(
  '/',
  {
    requestType: { query: getBlogsSchema },
    responses: {
      200: R.paginated(blogOutSchema),
    },
  },
  // canAccess(),
  handleGetBlogs,
);

// Create blog (using new response system)
blogRouter.post(
  '/',
  {
    requestType: { body: createBlogSchema },
    responses: {
      201: R.success(blogOutSchema),
    },
  },
  canAccess(),
  handleCreateBlog,
);

// Get blog by ID (using new response system)
blogRouter.get(
  '/:id',
  {
    requestType: { params: mongoIdSchema },
    responses: {
      200: R.success(blogOutSchema),
      404: R.error(),
    },
  },
  canAccess(),
  handleGetBlogById,
);

// Update blog (using new response system)
blogRouter.patch(
  '/:id',
  {
    requestType: {
      params: mongoIdSchema,
      body: updateBlogSchema,
    },
    responses: {
      200: R.success(blogOutSchema),
      404: R.error(),
    },
  },
  canAccess(),
  handleUpdateBlog,
);

// Delete blog (keeping legacy pattern for comparison)
blogRouter.delete('/:id', {}, canAccess(), handleDeleteBlog);

export default blogRouter.getRouter();
