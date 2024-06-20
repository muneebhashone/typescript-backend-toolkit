import { eq } from 'drizzle-orm';
import { SeaRatesAdaptor } from '../adapter/searates.adapter';
import { db } from '../drizzle/db';
import { SHIPMENT_PROGRESS_STATUSES } from '../drizzle/enums';
import { shipments, users } from '../drizzle/schema';
import { CreditsError } from '../errors/errors.service';
import logger from '../lib/logger.service';
import { Queue } from '../lib/queue.server';
import { deductCoins } from '../shipment/shipment.service';
import { TrackingEmailQueue } from './email.queue';
import { createTrackingJob } from './tracking.queue';

export const ShipmentQueue = Queue<{ shipmentId: number }>(
  'Shipment',
  async (job) => {
    const { data } = job;

    const { shipmentId } = data;

    logger.info(`Shipment Queue Job: ${shipmentId}`);

    try {
      const seaRatesAdaptor = new SeaRatesAdaptor();

      const shipment = await seaRatesAdaptor.checkTracking(shipmentId);

      const user = await db.query.users.findFirst({
        where: eq(users.id, shipment.creatorId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (shipment.isTracking) {
        await TrackingEmailQueue.add(String(shipment.id), {
          carrier: shipment.carrier,
          email: user.email,
          name: user.name,
          status: String(shipment.status),
          trackingNumber: String(
            shipment.trackWith === 'CONTAINER_NUMBER'
              ? shipment.containerNo
              : shipment.mblNo,
          ),
        });

        if (shipment.followers?.length) {
          await Promise.all(
            shipment.followers.map(async (followerEmail) => {
              return TrackingEmailQueue.add(String(shipment.id), {
                carrier: shipment.carrier,
                email: followerEmail,
                name: followerEmail,
                status: String(shipment.status),
                trackingNumber: String(
                  shipment.trackWith === 'CONTAINER_NUMBER'
                    ? shipment.containerNo
                    : shipment.mblNo,
                ),
              });
            }),
          );
        }
      }

      logger.info(
        `Shipment Queue Job: ${shipmentId}, Check Tracking:`,
        shipment,
      );

      if (shipment.isTracking) {
        await deductCoins('user', shipment.creatorId, 1);
        logger.info(
          `Shipment Queue Job: ${shipmentId} > Coins deducted from User`,
        );

        if ('id' in shipment && typeof shipment.id === 'number') {
          await createTrackingJob(shipment.id);
          logger.info(
            `Shipment Queue Job: ${shipmentId} > Tracking Job Created`,
          );
        }

        logger.info(`Shipment Queue Job: ${shipmentId} > Success Response`);
        return Promise.resolve(true);
      } else {
        logger.info(
          `Shipment Queue Job: ${shipmentId} > Not Queued for Tracking - Cancelled`,
        );
        return Promise.resolve(true);
      }
    } catch (err) {
      logger.error(`Shipment Queue Job: ${shipmentId} > Error Occured`);
      if (err instanceof CreditsError) {
        await db
          .update(shipments)
          .set({
            isTracking: false,
            progress: SHIPMENT_PROGRESS_STATUSES.INSUFFICIENT_CREDITS,
          })
          .where(eq(shipments.id, shipmentId))
          .execute();
        logger.error(
          `Shipment Queue Job: ${shipmentId} > Insufficient Credits`,
        );
      }

      await db
        .update(shipments)
        .set({
          isTracking: false,
          progress: 'RATE_LIMIT',
        })
        .where(eq(shipments.id, shipmentId))
        .execute();

      logger.error((err as Error).message);
      throw err;
    }
  },
);
