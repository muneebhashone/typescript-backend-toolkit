import mongoose, { Schema } from 'mongoose';

export interface IBusiness {
  thumbnail?: string;
  name: string;
  updatedAt?: Date;
  createdAt?: Date;
}

const BusinessSchema: Schema<IBusiness> = new Schema({
  thumbnail: { type: String },
  name: { type: String, required: true, unique: true },
  updatedAt: { type: Date, default: () => new Date() },
  createdAt: { type: Date, default: () => new Date() },
});

BusinessSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Export Business model
const Business = mongoose.model<IBusiness>('Business', BusinessSchema);
export default Business;
