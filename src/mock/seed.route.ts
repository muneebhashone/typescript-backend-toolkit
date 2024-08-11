import express from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../config/config.service';
import { handleUserSeeder } from '../user/user.controller';

const router = express.Router();

router.get(
  '/seedAll',
  async (_, res, next) => {
    if (!config.SET_SESSION) {
      next();
    } else {
      res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: 'This route is only available on development environment',
      });
    }
  },
  handleUserSeeder,
);

export default router;
