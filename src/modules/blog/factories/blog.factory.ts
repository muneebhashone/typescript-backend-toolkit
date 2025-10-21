import { Types } from 'mongoose';
import type { BlogModelType, BlogType } from '../blog.dto';
import { createBlog } from '../blog.services';

type Overrides = Partial<BlogModelType> & Record<string, any>;

export const blogFactory = {
  build(i = 1, overrides: Overrides = {}): BlogModelType {
    return {
      name: `Name ${i}`,
      description: `Description ${i}`,
      user: new Types.ObjectId() as any,
      _id: new Types.ObjectId() as any
      , ...overrides
    } as unknown as BlogModelType;
  },

  async create(i = 1, overrides: Overrides = {}): Promise<BlogType> {
    const payload = this.build(i, overrides);
    // Prefer service function when available
    return await createBlog(payload as any);
  },

  async createMany(count: number, overrides: Overrides = {}): Promise<BlogType[]> {
    const out: BlogType[] = [];
    for (let i = 1; i <= count; i += 1) out.push(await this.create(i, overrides));
    return out;
  },
};