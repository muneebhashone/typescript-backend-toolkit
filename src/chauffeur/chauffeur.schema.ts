import { z } from 'zod';
import { ChauffeurAvailability } from './chauffeur-types';

export const chauffeurBookingSchema = z.object({
  firstName: z.string().max(255, 'First name cannot exceed 255 characters'),
  lastName: z.string().max(255, 'Last name cannot exceed 255 characters'),
  chauffeurName: z.string().min(1, 'Chauffeur name is required'),
  phoneNo: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(15, 'Phone number cannot exceed 15 characters'),
  photo: z.string().url('Invalid URL format for photo'),
  idFront: z.string().url('Invalid URL format for ID front'),
  idBack: z.string().url('Invalid URL format for ID back'),
  verificationPhoto: z
    .string()
    .url('Invalid URL format for verification photo'),
  availabilityStatus: z.enum(
    Object.values(ChauffeurAvailability) as [
      keyof typeof ChauffeurAvailability,
    ],
  ),
});

export type ChauffeurBookingSchemaType = z.infer<typeof chauffeurBookingSchema>;

export type ChauffeurBookingFormValues = z.infer<typeof chauffeurBookingSchema>;
