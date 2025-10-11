import User from '../modules/user/user.model';
import { SessionModel } from '../modules/auth/session/session.model';
import Blog from '../modules/blog/blog.model';
import type { AdminResource } from './types';

export const adminResources: AdminResource[] = [
  {
    name: 'users',
    label: 'Users',
    model: User,
    readOnlyFields: ['_id', 'createdAt', 'updatedAt', 'password'],
    fileFields: ['avatar'],
  },
  {
    name: 'sessions',
    label: 'Sessions',
    model: SessionModel,
    readOnlyFields: ['_id', 'createdAt', 'updatedAt'],
  },
  {
    name: 'blogs',
    label: 'Blogs',
    model: Blog,
    readOnlyFields: ['_id', 'createdAt', 'updatedAt'],
  },
];

export function getResource(name: string): AdminResource | undefined {
  return adminResources.find((r) => r.name === name);
}
