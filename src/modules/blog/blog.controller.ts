import type { Request } from 'express';
import type { MongoIdSchemaType } from '@/common/common.schema';
import type { ResponseExtended } from '@/types';
import { successResponse } from '@/utils/response.utils';
import type {
  CreateBlogSchemaType,
  GetBlogsSchemaType,
  UpdateBlogSchemaType,
  CreateBlogResponseSchema,
  GetBlogsResponseSchema,
  GetBlogByIdResponseSchema,
  UpdateBlogResponseSchema,
} from './blog.schema';
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from './blog.services';

// Using new res.created() helper
export const handleCreateBlog = async (
  req: Request<unknown, unknown, CreateBlogSchemaType>,
  res: ResponseExtended<CreateBlogResponseSchema>,
) => {
  const blog = await createBlog(req.body);
  return res.json({
    success: true,
    message: 'Blog created successfully',
    data: blog,
  }) as unknown as void;
};

// Using new res.ok() helper with paginated response
export const handleGetBlogs = async (
  req: Request<unknown, unknown, unknown, GetBlogsSchemaType>,
  res: ResponseExtended<GetBlogsResponseSchema>,
) => {
  const { results, paginatorInfo } = await getBlogs(req.query);
  res.ok?.({
    success: true,
    data: {
      items: results,
      paginator: paginatorInfo,
    },
  })

  return;

};

// Using new res.ok() helper
export const handleGetBlogById = async (
  req: Request<MongoIdSchemaType>,
  res: ResponseExtended<GetBlogByIdResponseSchema>,
) => {
  const blog = await getBlogById(req.params.id);
  return res.ok?.({
    success: true,
    data: blog,
  });
};

// Using new res.ok() helper
export const handleUpdateBlog = async (
  req: Request<MongoIdSchemaType, unknown, UpdateBlogSchemaType>,
  res: ResponseExtended<UpdateBlogResponseSchema>,
) => {
  const blog = await updateBlog(req.params.id, req.body);
  return res.ok?.({
    success: true,
    message: 'Blog updated successfully',
    data: blog,
  });
};

// Keeping legacy pattern for comparison
export const handleDeleteBlog = async (
  req: Request<MongoIdSchemaType>,
  res: ResponseExtended,
) => {
  await deleteBlog({ id: req.params.id });
  return successResponse(res, 'Blog deleted successfully');
};
