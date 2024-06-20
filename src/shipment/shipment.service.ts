import {
  InferSelectModel,
  SQL,
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  inArray,
} from 'drizzle-orm';
import { getCompanyById } from '../company/company.service';
import { db } from '../drizzle/db';
import { companies, shipments, users } from '../drizzle/schema';
import { CreditsError, NotFoundError } from '../errors/errors.service';
import { ShipmentQueue } from '../queues/shipment.queue';
import { getUserById } from '../user/user.services';
import { GetPaginatorReturnType, getPaginator } from '../utils/getPaginator';
import { CreateShipmentType, GetAllShipmentsType } from './shipment.schema';

export const deductCoins = async (
  from: 'company' | 'user',
  id: number,
  deduction: number = 1,
): Promise<void> => {
  try {
    if (from === 'company') {
      const company = await getCompanyById(id);

      const creditAfterDeduction = (company?.credits ?? 0) - deduction;

      if (creditAfterDeduction < 0) {
        throw new CreditsError('Not sufficient credits');
      }

      await db
        .update(companies)
        .set({ credits: creditAfterDeduction })
        .where(eq(companies.id, id))
        .execute();
    }

    if (from === 'user') {
      const user = await getUserById(id);

      const creditAfterDeduction = (user?.credits ?? 0) - deduction;

      if (creditAfterDeduction < 0) {
        throw new CreditsError('Not sufficient credits');
      }

      await db
        .update(users)
        .set({ credits: creditAfterDeduction })
        .where(eq(users.id, id))
        .execute();
    }

    return;
  } catch (err) {
    throw new Error((err as Error).message);
  }
};

export const createShipment = async (
  payload: CreateShipmentType,
  user: InferSelectModel<typeof users>,
): Promise<InferSelectModel<typeof shipments>> => {
  const { trackWith, carrier, followers, tags } = payload;

  if (!user) {
    throw new Error('User is required');
  }

  if (!user?.credits) {
    throw new CreditsError('Not enought credits to perform this action');
  }

  const shipment = (
    await db
      .insert(shipments)
      .values({
        referenceNo: payload.referenceNo,
        carrier: carrier,
        trackWith: trackWith,
        tags: tags,
        followers: followers,
        containerNo: payload.containerNo,
        mblNo: payload.mblNo,
        creatorId: user.id,
        companyId: user.companyId,
        progress: 'IN_PROGRESS',
      })
      .returning()
      .execute()
  )[0];

  await ShipmentQueue.add(
    `track`,
    {
      shipmentId: shipment.id,
    },
    {
      removeOnComplete: { count: 0 },
    },
  );

  return shipment;
};

export type GetShipmentsReturnType = {
  results: InferSelectModel<typeof shipments>[];
  paginatorInfo: GetPaginatorReturnType;
};

export const getShipments = async (
  payload: GetAllShipmentsType & {
    companyId?: number | null;
    creatorId?: number | null;
  },
): Promise<GetShipmentsReturnType> => {
  let filter: SQL<unknown> | null = null;

  if (payload.companyId && payload.creatorId) {
    filter = and(
      eq(shipments.companyId, payload.companyId),
      eq(shipments.creatorId, payload.creatorId),
    ) as SQL<unknown>;
  } else if (payload.companyId) {
    filter = eq(shipments.companyId, payload.companyId) as SQL<unknown>;
  } else if (payload.creatorId) {
    filter = eq(shipments.creatorId, payload.creatorId) as SQL<unknown>;
  }

  if (payload.searchString) {
    filter = and(
      ...[
        filter ? filter : undefined,
        or(
          ilike(shipments.containerNo, `%${payload.searchString}%`),
          ilike(shipments.mblNo, `%${payload.searchString}%`),
          ilike(shipments.carrier, `%${payload.searchString}%`),
          ilike(shipments.sealine, `%${payload.searchString}%`),
          ilike(shipments.status, `%${payload.searchString}%`),
          ilike(shipments.type, `%${payload.searchString}%`),
          ilike(shipments.arrivalTime, `%${payload.searchString}%`),
        ),
      ].filter(Boolean),
    ) as SQL<unknown>;
  }

  let totalRecord = { count: 0 };

  if (filter) {
    totalRecord = (
      await db
        .select({ count: count() })
        .from(shipments)
        .where(filter)
        .execute()
    )[0];
  } else {
    totalRecord = (
      await db.select({ count: count() }).from(shipments).execute()
    )[0];
  }

  const paginatorInfo = getPaginator(
    payload.limitParam,
    payload.pageParam,
    totalRecord.count,
  );

  const shipmentResults = await db.query.shipments.findMany({
    ...(filter ? { where: filter } : {}),
    limit: paginatorInfo.limit,
    offset: paginatorInfo.skip,
    orderBy: desc(shipments.id),
  });

  return { results: shipmentResults, paginatorInfo };
};

export const deleteShipment = async (shipmentId: number) => {
  await db.delete(shipments).where(eq(shipments.id, shipmentId)).execute();
};

export const deleteBulkShipments = async (shipmentIds: number[]) => {
  await db
    .delete(shipments)
    .where(inArray(shipments.id, shipmentIds))
    .execute();
};

export const getShipmentById = async (
  shipmentId: number,
): Promise<InferSelectModel<typeof shipments>> => {
  const shipment = await db.query.shipments.findFirst({
    where: eq(shipments.id, shipmentId),
  });

  if (!shipment) {
    throw new NotFoundError('Shipment not found');
  }

  return shipment;
};

export const getShipmentByTrackingNumber = async (
  trackingNumber: string,
  creatorId: number,
): Promise<InferSelectModel<typeof shipments>> => {
  const shipment = await db.query.shipments.findFirst({
    where: and(
      or(
        eq(shipments.containerNo, trackingNumber),
        eq(shipments.mblNo, trackingNumber),
      ),
      eq(shipments.creatorId, creatorId),
    ),
  });

  if (!shipment) {
    throw new NotFoundError('Shipment not found');
  }

  return shipment;
};
