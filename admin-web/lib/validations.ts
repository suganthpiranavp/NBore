/**
 * ==============================================================================
 * Zod Validation Schemas (/lib/validations.ts)
 * Enterprise-grade validation engine ensuring strict integrity on all 22 fields.
 * ==============================================================================
 */

import { z } from 'zod';

export const dailyEntrySchema = z.object({
  // Metadata & Identification
  vehicleId: z.union([z.string(), z.number()]),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  managerId: z.string().min(1, 'Manager ID is required'),
  managerName: z.string().min(1, 'Manager name is required'),

  // 1. Agent
  agent: z.string().optional().default(''),

  // 2. Sub-Agent
  subAgent: z.string().optional().default(''),

  // 3. Work Date
  date: z.string().min(1, 'Date is required'),

  // 4. Party Number
  pNo: z.string().optional().default(''),

  // 5. Party Name
  pName: z.string().min(1, 'Party Name is required'),

  // 6. Site Location / Village
  placeVillage: z.string().min(1, 'Village / Location is required'),

  // 7. Bore Base Rate (Default: 120)
  bRate: z.coerce.number().min(0, 'Base rate must be non-negative').default(120),

  // 8. Total Depth (in feet)
  depth: z.coerce.number().min(0, 'Drilled depth must be non-negative'),

  // 9. Rod Count / Length (Default: 25)
  rod: z.coerce.number().min(0).default(25),

  // 10. M.S. Casing Object
  msCasing: z.object({
    feet: z.coerce.number().min(0).default(0),
    rate: z.coerce.number().min(0).default(120),
    total: z.coerce.number().min(0).default(0),
    isManualOverride: z.boolean().default(false),
  }).default({ feet: 0, rate: 120, total: 0, isManualOverride: false }),

  // 11. Welding Object (Default rate ₹250)
  welding: z.object({
    count: z.coerce.number().min(0).default(0),
    ratePerUnit: z.coerce.number().default(250),
    total: z.coerce.number().min(0).default(0),
  }).default({ count: 0, ratePerUnit: 250, total: 0 }),

  // 12. PVC Casing Object
  pvcCasing: z.object({
    feet: z.coerce.number().min(0).default(0),
    rate: z.coerce.number().min(0).default(0),
    total: z.coerce.number().min(0).default(0),
  }).default({ feet: 0, rate: 0, total: 0 }),

  // 13. Recutting Object (Default rate ₹140)
  recutting: z.object({
    count: z.coerce.number().min(0).default(0),
    ratePerUnit: z.coerce.number().default(140),
    total: z.coerce.number().min(0).default(0),
  }).default({ count: 0, ratePerUnit: 140, total: 0 }),

  // 14. Rebore Object
  rebore: z.object({
    feet: z.coerce.number().min(0).default(0),
    rate: z.coerce.number().min(0).default(0),
    total: z.coerce.number().min(0).default(0),
  }).default({ feet: 0, rate: 0, total: 0 }),

  // 15. Flushing Object
  flushing: z.object({
    feet: z.coerce.number().min(0).default(0),
    rate: z.coerce.number().min(0).default(40),
    total: z.coerce.number().min(0).default(0),
  }).default({ feet: 0, rate: 40, total: 0 }),

  // 16. RPM Details Object
  rpmDetails: z.object({
    sRpm: z.coerce.number().min(0).default(0),
    runRpm: z.coerce.number().min(0).default(0),
    cRpm: z.coerce.number().min(0).default(0),
    avgRpm: z.coerce.number().min(0).default(0),
  }).default({ sRpm: 0, runRpm: 0, cRpm: 0, avgRpm: 0 }),

  // 17. Bit Details Object
  bitDetails: z.object({
    max: z.coerce.number().min(0).default(0),
    min: z.coerce.number().min(0).default(0),
    mm: z.coerce.number().min(0).default(0),
  }).default({ max: 0, min: 0, mm: 0 }),

  // 18. Hammer Details Object
  hammerDetails: z.object({
    company: z.string().optional().default(''),
    num: z.string().optional().default(''),
    depth: z.coerce.number().min(0).default(0),
  }).default({ company: '', num: '', depth: 0 }),

  // 19. Diesel Object
  diesel: z.object({
    liters: z.coerce.number().min(0).default(0),
    ratePerLiter: z.coerce.number().min(0).default(0),
    totalCost: z.coerce.number().min(0).default(0),
  }).default({ liters: 0, ratePerLiter: 0, totalCost: 0 }),

  // 20. Cash Received on Site
  cashReceived: z.coerce.number().min(0).default(0),

  // 21. Driller Name
  drillerName: z.string().optional().default(''),

  // 22. Site / Bore Remarks
  boreRemarks: z.string().optional().default(''),
});

export type DailyEntryInput = z.infer<typeof dailyEntrySchema>;
