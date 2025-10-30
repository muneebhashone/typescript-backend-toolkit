// Auth is disabled - providing stub export
import { Request, Response, NextFunction } from 'express';
export const canAccess = () => (req: Request, res: Response, next: NextFunction) => next();
