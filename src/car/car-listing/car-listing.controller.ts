import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/api.utils';
import {
  createCar,
  deleteCar,
  deleteCars,
  getCar,
  getCarMakes,
  getCarModelsByMake,
  getCars,
  updateCar,
} from './car-listing.service';
import {
  CarCreateSchemaType,
  CarUpdateSchemaType,
  CarIdSchemaType,
  CarListQueryParamsType,
  CarMakeSchemaType,
} from './car-listing.schema';

export const handleGetCarMakes = async (
  _: Request<never, never, never>,
  res: Response,
) => {
  try {
    const result = await getCarMakes();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetCarModelsByMake = async (
  req: Request<CarMakeSchemaType, never, never>,
  res: Response,
) => {
  try {
    const result = await getCarModelsByMake(req.params.make);

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetCars = async (
  req: Request<never, never, never, CarListQueryParamsType>,
  res: Response,
) => {
  try {
    const result = await getCars(req.query);

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateCar = async (
  req: Request<never, never, CarCreateSchemaType>,
  res: Response,
) => {
  try {
    const newCar = await createCar(req.body, req.user);

    return successResponse(res, 'Car created successfully', newCar);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateCar = async (
  req: Request<CarIdSchemaType, never, CarUpdateSchemaType>,
  res: Response,
) => {
  try {
    const updatedCar = await updateCar(
      {
        id: req.params.id,
      },
      req.body,
    );

    return successResponse(res, 'Car updated successfully', updatedCar);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetCar = async (
  req: Request<CarIdSchemaType>,
  res: Response,
) => {
  try {
    const result = await getCar({ id: req.params.id });

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteCar = async (
  req: Request<CarIdSchemaType>,
  res: Response,
) => {
  try {
    await deleteCar({ id: req.params.id });

    return successResponse(res, 'Car deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteCars = async (_: Request, res: Response) => {
  try {
    await deleteCars();

    return successResponse(res, 'Cars deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
