import type { FilterQuery } from "mongoose";
import type { MongoIdSchemaType } from "@/common/common.schema";
import { getPaginator } from "@/utils/pagination.utils";
import type { BlogType } from "./blog.dto";
import Blog, { type IBlogDocument } from "./blog.model";
import type { CreateBlogSchemaType, GetBlogsSchemaType, UpdateBlogSchemaType } from "./blog.schema";

export const createBlog = async (
  payload: CreateBlogSchemaType,
): Promise<BlogType> => {
  const createdBlog = await Blog.create(payload);
  return createdBlog.toObject();
};

export const getBlogById = async (blogId: string): Promise<BlogType> => {
  const blog = await Blog.findById(blogId);
  
  if (!blog) {
    throw new Error("Blog not found");
  }
  
  return blog.toObject();
};

export const updateBlog = async (
  blogId: string,
  payload: UpdateBlogSchemaType,
): Promise<BlogType> => {
  const blog = await Blog.findByIdAndUpdate(
    blogId,
    { $set: payload },
    { new: true },
  );
  
  if (!blog) {
    throw new Error("Blog not found");
  }
  
  return blog.toObject();
};

export const deleteBlog = async (blogId: MongoIdSchemaType): Promise<void> => {
  const blog = await Blog.findByIdAndDelete(blogId.id);
  
  if (!blog) {
    throw new Error("Blog not found");
  }
};

export const getBlogs = async (
  payload: GetBlogsSchemaType,
) => {
  const conditions: FilterQuery<IBlogDocument> = {};
  
  if (payload.searchString) {
    conditions.$or = [
      { name: { $regex: payload.searchString, $options: "i" } },
      { description: { $regex: payload.searchString, $options: "i" } },
    ];
  }
  
  const totalRecords = await Blog.countDocuments(conditions);
  const paginatorInfo = getPaginator(
    payload.limitParam,
    payload.pageParam,
    totalRecords,
  );
  
  const results = await Blog.find(conditions)
    .limit(paginatorInfo.limit)
    .skip(paginatorInfo.skip)
    .exec();
  
  return {
    results,
    paginatorInfo,
  };
};
