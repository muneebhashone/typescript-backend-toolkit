import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  getCitiesByCountryId,
  getCitiesByStateId,
  getCountries,
  getStatesByCountryId,
} from './setup.service';
import { CountryIdSchemaType, StateIdSchemaType } from './setup.schema';

export const handleGetCountries = async (_: Request, res: Response) => {
  try {
    const countries = getCountries();

    return successResponse(res, 'Countries', countries);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetCitiesByCountryId = async (
  req: Request<CountryIdSchemaType>,
  res: Response,
) => {
  try {
    const cities = getCitiesByCountryId(req.params.countryId);

    return successResponse(res, 'Cities', cities);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetCitiesByStateId = async (
  req: Request<StateIdSchemaType>,
  res: Response,
) => {
  try {
    const cities = getCitiesByStateId(req.params.stateId);

    return successResponse(res, 'Cities', cities);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetStatesByCountryId = async (
  req: Request<CountryIdSchemaType>,
  res: Response,
) => {
  try {
    const states = getStatesByCountryId(req.params.countryId);

    return successResponse(res, 'States', states);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
