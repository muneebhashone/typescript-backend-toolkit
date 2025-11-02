import mongoose, { Schema, type Document } from 'mongoose';
import type { SessionRecord, SessionMetadata } from './session.types';

export interface SessionDocument
  extends Omit<SessionRecord, 'sessionId'>,
    Document {
  _id: string;
}

const sessionMetadataSchema = new Schema<SessionMetadata>(
  {
    userAgent: { type: String },
    ipAddress: { type: String },
    deviceType: { type: String },
    browser: { type: String },
    os: { type: String },
  },
  { _id: false },
);

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    metadata: {
      type: sessionMetadataSchema,
    },
    lastSeen: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

sessionSchema.index({ userId: 1, createdAt: -1 });

export const SessionModel = mongoose.model<SessionDocument>(
  'Session',
  sessionSchema,
);
