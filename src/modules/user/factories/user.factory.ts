import { ROLE_ENUM } from '../../../enums';
import type { UserModelType, UserType } from '../user.dto';
import { createUser } from '../user.services';

type Overrides = Partial<UserModelType> & { password?: string };

const base = (i = 1): UserModelType & { password: string } => ({
  email: `user${i}@example.com`,
  username: `user${i}`,
  name: `User ${i}`,
  role: ROLE_ENUM.DEFAULT_USER,
  password: 'password123',
});

export const userFactory = {
  build(i = 1, overrides: Overrides = {}): UserModelType & { password: string } {
    return { ...base(i), ...overrides } as UserModelType & { password: string };
  },

  async create(i = 1, overrides: Overrides = {}): Promise<UserType> {
    const payload = this.build(i, overrides);
    return createUser(payload);
  },

  async createMany(count: number, overrides: Overrides = {}): Promise<UserType[]> {
    const result: UserType[] = [];
    for (let i = 1; i <= count; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const u = await this.create(i, overrides);
      result.push(u);
    }
    return result;
  },
};

