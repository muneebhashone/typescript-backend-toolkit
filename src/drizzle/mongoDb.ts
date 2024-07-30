import mongoose from 'mongoose';
import config from '../config/config.service';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_DATABASE_URL);
    console.info('Database connected');
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
};
