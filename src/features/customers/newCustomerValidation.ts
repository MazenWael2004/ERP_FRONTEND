import { z } from 'zod';

export const newCustomerSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  code: z.string().min(1, 'Customer code is required'),
  customerTypeId: z.string().min(1, 'Customer type is required'),
  structure: z.enum(['SINGLE', 'CHAIN']),
  statusId: z.string().min(1, 'Status is required'),
  credit: z.coerce.number().min(0, 'Credit cannot be negative'),
  taxNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  zoneId: z.string().min(1, 'Zone is required'),
  branches: z.array(z.object({
    managerId: z.string().optional(),
    isMainBranch: z.boolean(),
    buildingNumber: z.string().min(1, 'Building number is required'),
    street: z.string().min(1, 'Street is required'),
    glnCode: z.string().optional(),
    zoneId: z.string().min(1, 'Zone is required'),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    phones: z.array(z.object({
      phoneNumber: z.string().min(1, 'Phone number is required'),
      phoneType: z.enum(['LANDLINE', 'MOBILE', 'WHATSAPP']),
      isPrimary: z.boolean(),
    })),
  })).min(1, 'At least one branch is required'),
  documents: z.array(z.object({
    type: z.string().min(1, 'Document type is required'),
    documentNumber: z.string().optional(),
    issuedAt: z.string().optional(),
    expiresAt: z.string().optional(),
    file: z.any().optional(),
  })),
});

export type NewCustomerFormValues = z.infer<typeof newCustomerSchema>;