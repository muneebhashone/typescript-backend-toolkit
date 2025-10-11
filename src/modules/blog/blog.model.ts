import mongoose, { type Document, Schema } from "mongoose";
import type { BlogModelType, BlogType } from "./blog.dto";

const BlogSchema: Schema<BlogType> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true },
);

export interface IBlogDocument extends Document<string>, BlogModelType {}
const Blog = mongoose.model<BlogType>("Blog", BlogSchema);
export default Blog;
