import { eq } from 'drizzle-orm';
import { SeaRatesSDK } from '../adapter/searates.adapter';
import { db } from '../drizzle/db';
import { TrackWithType } from '../drizzle/enums';
import { shipments } from '../drizzle/schema';
import logger from '../lib/logger.service';
import { Queue } from '../lib/queue.server';
import { TrackingEmailQueue } from './email.queue';

export type ITrackingQueueData = {
  shipmentId: number;
};

export type CreateTrackingQueueType = {
  arrivalTime: string;
  containerNo?: string | null;
  mblNo?: string | null;
  trackWith: TrackWithType;
  companyId?: number | null;
  creatorId?: number | null;
  carrier: string;
};

export const createTrackingJob = async (shipmentId: number) => {
  const shipment = await db.query.shipments.findFirst({
    where: eq(shipments.id, shipmentId),
  });

  if (!shipment) {
    return;
  }

  const { arrivalTime, trackWith, carrier, companyId } = shipment;

  if (!arrivalTime) {
    await db
      .update(shipments)
      .set({ progress: 'ARRIVAL_TIME_NOT_FOUND' })
      .execute();

    throw new Error('ARRIVAL_TIME_NOT_FOUND');
  }

  if (!carrier) {
    await db
      .update(shipments)
      .set({ progress: 'ARRIVAL_TIME_NOT_FOUND' })
      .execute();

    throw new Error('ARRIVAL_TIME_NOT_FOUND');
  }

  const trackingNumber =
    trackWith === 'CONTAINER_NUMBER' ? shipment.containerNo : shipment.mblNo;
  const updatedDate = new Date(arrivalTime);
  const hours = updatedDate.getHours();
  const minutes = updatedDate.getMinutes();
  const seconds = updatedDate.getSeconds();
  const repeat = { pattern: `${seconds} ${minutes} ${hours} * * *` };
  const queueName = `${trackingNumber}:${companyId}:${carrier}`;

  if (Number(updatedDate) > Number(new Date())) {
    await TrackingQueue.add(
      queueName,
      { shipmentId: shipment.id },
      {
        repeat: repeat,
        removeOnComplete: { count: 0 },
      },
    );
  }

  if (!shipment.isTracking) {
    await db
      .update(shipments)
      .set({ isTracking: true })
      .where(eq(shipments.id, shipmentId))
      .execute();
  }
};

export const TrackingQueue = Queue<ITrackingQueueData>(
  'Tracking',
  async (job) => {
    try {
      const { data } = job;
      const { shipmentId } = data;

      const shipment = await db.query.shipments.findFirst({
        where: eq(shipments.id, shipmentId),
        with: {
          user: true,
        },
      });

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      const seaRatesSDK = new SeaRatesSDK();

      const trackingNumber = String(
        shipment.trackWith === 'CONTAINER_NUMBER'
          ? shipment.containerNo
          : shipment.mblNo,
      );

      const { data: apiResponse } = await seaRatesSDK.getTracking(
        String(trackingNumber),
        shipment.carrier,
      );

      const dbStatus = shipment?.status;
      const apiStatus = apiResponse.metadata.status;
      const jobs = await TrackingQueue.getRepeatableJobs();

      const queueName = `${trackingNumber}:${shipment.companyId}:${shipment.carrier}`;

      if (jobs.length && apiStatus === 'DELIVERED') {
        const jobToDelete = jobs.find((queue) => queue.name === queueName);
        await TrackingQueue.removeRepeatableByKey(jobToDelete?.key as string);
        await TrackingEmailQueue.add(String(shipment.id), {
          carrier: shipment.carrier,
          email: shipment?.user?.email as string,
          name: shipment?.user?.name as string,
          status: apiStatus,
          trackingNumber,
        });
      }

      if (apiStatus !== dbStatus) {
        await db
          .update(shipments)
          .set({ status: apiStatus })
          .where(eq(shipments.id, shipmentId));

        await TrackingEmailQueue.add(String(shipment.id), {
          carrier: shipment.carrier,
          email: shipment?.user?.email as string,
          name: shipment?.user?.name as string,
          status: apiStatus,
          trackingNumber,
        });

        return true;
      }
    } catch (err) {
      if (err instanceof Error) logger.error(err.message);
    }
  },
);
