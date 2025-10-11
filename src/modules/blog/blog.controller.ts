import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { MongoIdSchemaType } from "../../common/common.schema";
import { successResponse } from "../../utils/api.utils";
import type { CreateBlogSchemaType, GetBlogsSchemaType, UpdateBlogSchemaType } from "./blog.schema";
import { createBlog, deleteBlog, getBlogById, getBlogs, updateBlog } from "./blog.services";

export const handleCreateBlog = async (
  req: Request<unknown, unknown, CreateBlogSchemaType>,
  res: Response,
) => {
  const blog = await createBlog(req.body);
  return successResponse(
    res,
    "Blog created successfully",
    blog,
    StatusCodes.CREATED,
  );
};

export const handleGetBlogs = async (
  req: Request<unknown, unknown, unknown, GetBlogsSchemaType>,
  res: Response,
) => {
  const { results, paginatorInfo } = await getBlogs(req.query);
  return successResponse(res, undefined, { results, paginatorInfo });
};

export const handleGetBlogById = async (
  req: Request<MongoIdSchemaType>,
  res: Response,
) => {
  const blog = await getBlogById(req.params.id);
  return successResponse(res, undefined, blog);
};

export const handleUpdateBlog = async (
  req: Request<MongoIdSchemaType, unknown, UpdateBlogSchemaType>,
  res: Response,
) => {
  const blog = await updateBlog(req.params.id, req.body);
  return successResponse(res, "Blog updated successfully", blog);
};

export const handleDeleteBlog = async (
  req: Request<MongoIdSchemaType>,
  res: Response,
) => {
  await deleteBlog({ id: req.params.id });
  return successResponse(res, "Blog deleted successfully");
};
