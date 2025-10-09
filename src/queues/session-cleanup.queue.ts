import { Queue } from '../lib/queue.server';
import { getSessionManager } from '../modules/auth/session/session.manager';
import { createChildLogger } from '../observability/logger';
import config from '../config/env';

const logger = createChildLogger({ context: 'SessionCleanupQueue' });

interface SessionCleanupPayload {
  type: 'full' | 'revoked' | 'expired';
}

export const SessionCleanupQueue = Queue<SessionCleanupPayload>(
  'SessionCleanupQueue',
  async (job) => {
    if (!config.SET_SESSION) {
      logger.debug('Session management disabled, skipping cleanup');
      return { skipped: true };
    }

    try {
      const { data } = job;
      const sessionManager = getSessionManager();
      
      logger.info({ type: data.type }, 'Starting session cleanup');
      
      const startTime = Date.now();
      const stats = await sessionManager.cleanupSessions(data.type);
      const duration = Date.now() - startTime;
      
      logger.info(
        { 
          ...stats, 
          duration,
          type: data.type 
        },
        'Session cleanup completed'
      );
      
      return stats;
    } catch (err) {
      logger.error({ err }, 'Session cleanup failed');
      throw err;
    }
  },
);

export async function scheduleSessionCleanup(): Promise<void> {
  if (!config.SET_SESSION || !config.SESSION_CLEANUP_ENABLED) {
    logger.info('Session cleanup disabled, skipping schedule');
    return;
  }

  try {
    await SessionCleanupQueue.add(
      'recurring-cleanup',
      { type: 'full' },
      {
        repeat: {
          pattern: config.SESSION_CLEANUP_CRON,
        },
        jobId: 'session-cleanup-recurring',
      }
    );

    logger.info(
      { pattern: config.SESSION_CLEANUP_CRON },
      'Session cleanup job scheduled'
    );
  } catch (err) {
    logger.error({ err }, 'Failed to schedule session cleanup job');
  }
}
