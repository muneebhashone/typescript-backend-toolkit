import type { Seeder } from '../../../seeders/types';
import User from '../user.model';
import { userFactory } from '../factories/user.factory';
import config from '../../../config/env';

export const UserSeeder: Seeder = {
  name: 'UserSeeder',
  groups: ['base', 'dev', 'test'],
  dependsOn: [],
  collections: ['users'],
  async run(ctx) {
    // Ensure admin user (idempotent by email)
    const adminEmail = config.ADMIN_EMAIL;
    const adminPassword = config.ADMIN_PASSWORD;

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const admin = await userFactory.create(0, {
        email: adminEmail,
        username: 'admin',
        name: 'Admin',
        password: adminPassword,
        role: 'SUPER_ADMIN',
      });
      ctx.refs.set('user.admin.id', String(admin._id));
    } else {
      ctx.refs.set('user.admin.id', String(existingAdmin._id));
    }

    // Dev fixtures
    if (ctx.env.group === 'dev') {
      const count = await User.countDocuments({ email: { $regex: /^user\d+@example\.com$/ } });
      if (count === 0) {
        await userFactory.createMany(5);
      }
    }
  },
};

