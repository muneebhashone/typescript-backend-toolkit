import axios, { AxiosInstance } from 'axios';
import { InferInsertModel, eq } from 'drizzle-orm';
import config from '../config/config.service';
import { db } from '../drizzle/db';
import { shipments, vessels } from '../drizzle/schema';
import {
  SeaRatesApiResponse,
  SearatesSealineApiResponse,
} from '../tracking/types';
import { APIAdaptor } from './adapter.types';

export class SeaRatesSDK {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.SEARATES_URL,
      params: { api_key: config.SEARATES_API_KEY },
    });
  }

  async getTracking(
    trackingNumber: string,
    carrier: string,
  ): Promise<SeaRatesApiResponse> {
    const { data } = await this.api.get('/tracking', {
      params: {
        number: trackingNumber,
        sealine: carrier,
      },
    });

    return data;
  }

  async getAllContainers(): Promise<SearatesSealineApiResponse> {
    const { data } =
      await this.api.get<SearatesSealineApiResponse>('/info/sealines');
    return data;
  }
}

export class SeaRatesAdaptor implements APIAdaptor {
  sdk: SeaRatesSDK;

  constructor() {
    this.sdk = new SeaRatesSDK();
  }

  async checkTracking(
    shipmentId: number,
  ): Promise<InferInsertModel<typeof shipments>> {
    const errorCasses = [
      'SEALINE_HASNT_PROVIDE_INFO',
      'SEALINE_CANCELED_SHIPMENT',
      'NO_CONTAINERS',
      'NO_EVENTS',
    ];

    let shipment = await db.query.shipments.findFirst({
      where: eq(shipments.id, shipmentId),
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const trackingNumber =
      shipment?.trackWith === 'MBL_NUMBER'
        ? shipment.mblNo
        : shipment.containerNo;

    const response = await this.sdk.getTracking(
      String(trackingNumber),
      String(shipment?.carrier),
    );

    if (response.status === 'success') {
      if (errorCasses.includes(response.message)) {
        shipment = (
          await db
            .update(shipments)
            .set({ progress: response.message, isTracking: false })
            .where(eq(shipments.id, shipment.id))
            .returning()
            .execute()
        )[0];
      } else {
        const metadata = response.data.metadata;

        const vesselData = response.data.vessels.map((ves) => {
          return { name: ves.name, flag: ves.flag, fid: ves.id };
        });

        const updatedData: Partial<InferInsertModel<typeof shipments>> = {
          type: metadata.type,
          aggregator: 'SEARATE',
          sealine: metadata.sealine_name,
          carrier: metadata.sealine,
          status: metadata.status,
          arrivalTime: response.data.route.pod.date,
          progress: response.message,
          isTracking: true,
        };

        shipment = (
          await db
            .update(shipments)
            .set({ ...updatedData })
            .where(eq(shipments.id, shipment.id))
            .returning()
            .execute()
        )[0];

        if (vesselData.length) {
          await db
            .insert(vessels)
            .values({ shipmentId: shipment.id, ...vesselData });
        }
      }
    } else {
      shipment = (
        await db
          .update(shipments)
          .set({ progress: response.message, isTracking: false })
          .where(eq(shipments.id, shipment.id))
          .returning()
          .execute()
      )[0];
    }

    return shipment;
  }
}
