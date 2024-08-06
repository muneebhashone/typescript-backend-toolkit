import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { seedBookingTypes } from '../apartment/booking-type/bookingType.service';
import { seedCancellationPolicies } from '../apartment/cancellation-policy/cancellation-policy.service';
import { seedDiscounts } from '../apartment/discount/discount.service';
import { seedFacilities } from '../apartment/facility/facility.service';
import { seedHouseRules } from '../apartment/house-rule/house-rule.service';
import { seedPropertyTypes } from '../apartment/property-type/property-type.service';
import { seedTypesOfPlace } from '../apartment/type-of-place/type-of-place.service';
import { seedBusinesses } from '../business/business.service';
import seedChauffeurs from '../chauffeur/chauffeur.seeder';
import config from '../config/config.service';
import { handleUserSeeder } from '../user/user.controller';

const router = express.Router();

router.get(
  '/seedAll',
  async (_, res, next) => {
    if (!config.SET_SESSION) {
      next();
    } else {
      res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: 'This route is only available on development environment',
      });
    }
  },
  async (req: Request, res: Response) => {
    try {
      await seedBookingTypes();
      await seedCancellationPolicies();
      await seedDiscounts();
      await seedFacilities();
      await seedHouseRules();
      await seedPropertyTypes();
      await seedTypesOfPlace();
      await seedBusinesses();
      await seedChauffeurs();
      await handleUserSeeder(req, res);
    } catch (error) {
      console.log({ error });
    }
  },
);

export default router;
