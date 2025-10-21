import type { Seeder } from '@/seeders/types';
import Blog from '../blog.model';
import { blogFactory } from '../factories/blog.factory';

export const BlogSeeder: Seeder = {
  name: 'BlogSeeder',
  groups: ['base','dev','test'],
  dependsOn: ["UserSeeder"],
  collections: [Blog.collection.collectionName],
  async run(ctx) {
    if (ctx.env.group === 'dev' || ctx.env.group === 'test') {
      const existing = await Blog.countDocuments({ name: { $regex: /^Name \d+$/ } });
      if (existing === 0) {
        const docs = await blogFactory.createMany(5, {
        user: (ctx.refs.has('user:seeded') ? ctx.refs.get<string[]>('user:seeded')[0] : undefined) as any
      });
        ctx.refs.set('blog:seeded', docs.map((d: any) => String(d._id)));
      } else {
        const ids = (await Blog.find({}).select('_id').lean()).map((d: any) => String(d._id));
        ctx.refs.set('blog:seeded', ids);
      }
    }
  },
};