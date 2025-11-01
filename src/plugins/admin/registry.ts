import User from '@/modules/user/user.model';
import { SessionModel } from '@/modules/auth/session/session.model';
import type { AdminResource } from './types';

export const adminResources: AdminResource[] = [
  {
    name: 'users',
    label: 'Users',
    model: User,
    readOnlyFields: ['_id', 'createdAt', 'updatedAt', 'password'],
    fileFields: ['avatar'],
    displayField: 'email',
  },
  {
    name: 'sessions',
    label: 'Sessions',
    model: SessionModel,
    readOnlyFields: ['_id', 'createdAt', 'updatedAt'],
    displayField: 'tokenHash',
  },
];

export function getResource(name: string): AdminResource | undefined {
  return adminResources.find((r) => r.name === name);
}

// Helper: map mongoose modelName -> admin resource
const modelNameToResource = new Map<string, AdminResource>();
for (const res of adminResources) {
  try {
    const modelName = res.model.modelName;
    if (modelName) modelNameToResource.set(modelName, res);
  } catch {
    // ignore
  }
}

export function getResourceByModelName(
  modelName: string,
): AdminResource | undefined {
  return modelNameToResource.get(modelName);
}
