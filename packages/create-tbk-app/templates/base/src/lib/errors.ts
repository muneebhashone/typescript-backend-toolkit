/**
 * Base error class for all library errors
 * Follows the existing EmailError pattern with cause tracking
 */
export class LibraryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'LibraryError';
  }
}

/**
 * Database-related errors (Mongoose, MongoDB)
 */
export class DatabaseError extends LibraryError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'DatabaseError';
  }
}

/**
 * Cache-related errors (Redis)
 */
export class CacheError extends LibraryError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'CacheError';
  }
}

/**
 * Queue-related errors (BullMQ)
 */
export class QueueError extends LibraryError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'QueueError';
  }
}

/**
 * Email-related errors (Mailgun, Nodemailer)
 */
export class EmailError extends LibraryError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'EmailError';
  }
}

/**
 * Storage-related errors (S3, file uploads)
 */
export class StorageError extends LibraryError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'StorageError';
  }
}
