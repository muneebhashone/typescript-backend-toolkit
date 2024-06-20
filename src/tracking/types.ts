import { SEARATES_CODES } from "../shipment/constants";

interface Location {
  id: number;
  name: string;
  state: string;
  country: string;
  country_code: string;
  locode: string;
  lat: number;
  lng: number;
  timezone: string;
}

interface Facility {
  id: number;
  name: string;
  country_code: string;
  locode: string;
  bic_code: string | null;
  smdg_code: string;
  lat: number;
  lng: number;
}

interface Event {
  order_id: number;
  location: number;
  facility: number | null;
  description: string;
  event_type: string;
  event_code: string;
  status: string;
  date: string;
  actual: boolean;
  is_additional_event: boolean;
  type: string;
  transport_type: string;
  vessel: number | null;
  voyage: string | null;
}

interface ApiVessel {
  id: number;
  name: string;
  imo: number;
  call_sign: string;
  mmsi: number;
  flag: string;
}

interface Container {
  number: string;
  iso_code: string;
  status: string;
  events: Event[];
}

interface RoutePath {
  path: [number, number][];
  type: string;
}

interface RouteData {
  route: RoutePath[];
  pin: [number, number];
}

interface Metadata {
  type: string;
  number: string;
  sealine: string;
  sealine_name: string;
  status: string;
  updated_at: string;
  api_calls: {
    total: number | null;
    used: number | null;
    remaining: number | null;
  };
  unique_shipments: {
    total: number;
    used: number;
    remaining: number;
  };
}

interface SeaRatesData {
  metadata: Metadata;
  locations: Location[];
  facilities: Facility[];
  route: {
    prepol: {
      location: number;
      date: string;
      actual: boolean;
    };
    pol: {
      location: number;
      date: string;
      actual: boolean;
    };
    pod: {
      location: number;
      date: string;
      actual: boolean;
      predictive_eta: string | null;
    };
    postpod: {
      location: number | null;
      date: string | null;
      actual: boolean | null;
    };
  };
  vessels: ApiVessel[];
  containers: Container[];
  route_data: RouteData;
}
export type APIMessage = keyof typeof SEARATES_CODES;
export interface SeaRatesApiResponse {
  status: "error" | "success";
  message: APIMessage;
  data: SeaRatesData;
}

export interface ShippingLine {
  name: string;
  active: boolean;
  active_types: {
    ct: boolean;
    bl: boolean;
    bk: boolean;
  };
  maintenance: boolean;
  scac_codes: string[];
  prefixes: string[] | null;
}

export interface SearatesSealineApiResponse {
  status: "success" | "error";
  message: "OK" | "UNEXPECTED_ERROR";
  data: ShippingLine[];
}
