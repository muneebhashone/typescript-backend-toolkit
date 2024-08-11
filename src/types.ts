import { IUser } from './user/user.model';

export type UserType = IUser & { _id?: string };

export interface GoogleCallbackQuery {
  code: string;
  error?: string;
}
