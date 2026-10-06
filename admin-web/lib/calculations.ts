/**
 * ==============================================================================
 * Automated Dynamic Pricing & Slab Calculation Engine (/lib/calculations.ts)
 * Enterprise-grade pricing engine for Nithya Borewells.
 * Pure functions with zero side-effects for automated rate derivation.
 * ==============================================================================
 */

/**
 * 1. M.S. Casing Rate Slabs (Derived by total drilled depth in feet)
 * - 0 – 500 ft: ₹120/ft
 * - 501 – 600 ft: ₹130/ft
 * - 601 – 700 ft: ₹140/ft
 * - 701 – 800 ft: ₹150/ft
 * - 801 – 900 ft: ₹160/ft
 * - 901 – 1000 ft: ₹170/ft
 * - 1001 – 1100 ft: ₹340/ft
 * - 1101 – 1200 ft: ₹680/ft
 * - 1201 – 1300 ft: ₹1360/ft
 * - > 1300 ft: ₹1360/ft (base premium ceiling)
 */
export function getMsCasingRate(depth: number): number {
  const d = Math.max(0, Number(depth) || 0);

  if (d <= 500) return 120;
  if (d <= 600) return 130;
  if (d <= 700) return 140;
  if (d <= 800) return 150;
  if (d <= 900) return 160;
  if (d <= 1000) return 170;
  if (d <= 1100) return 340;
  if (d <= 1200) return 680;
  return 1360; // 1201 ft and beyond
}

/**
 * Calculates M.S. Casing total with support for Contra Edit (manual override)
 */
export function calculateMsCasing({
  feet,
  depth,
  customRate,
  isManualOverride = false,
}: {
  feet: number;
  depth: number;
  customRate?: number;
  isManualOverride?: boolean;
}): { feet: number; rate: number; total: number; isManualOverride: boolean } {
  const safeFeet = Math.max(0, Number(feet) || 0);
  const derivedRate = isManualOverride && customRate !== undefined && customRate >= 0
    ? Number(customRate)
    : getMsCasingRate(depth);

  const total = parseFloat((safeFeet * derivedRate).toFixed(2));

  return {
    feet: safeFeet,
    rate: derivedRate,
    total,
    isManualOverride: Boolean(isManualOverride),
  };
}

/**
 * 2. Flushing Rate Slabs (Derived by total feet flushed)
 * - 0 – 300 ft: ₹40/ft
 * - 301 – 600 ft: ₹150/ft
 * - 601 – 700 ft: ₹160/ft
 * - > 700 ft: ₹160/ft
 */
export function getFlushingRate(flushingFeet: number): number {
  const f = Math.max(0, Number(flushingFeet) || 0);

  if (f <= 300) return 40;
  if (f <= 600) return 150;
  return 160;
}

export function calculateFlushing({
  feet,
  customRate,
}: {
  feet: number;
  customRate?: number;
}): { feet: number; rate: number; total: number } {
  const safeFeet = Math.max(0, Number(feet) || 0);
  const rate = customRate !== undefined && customRate >= 0 ? Number(customRate) : getFlushingRate(safeFeet);
  const total = parseFloat((safeFeet * rate).toFixed(2));

  return { feet: safeFeet, rate, total };
}

/**
 * 3. Welding Auto-Calculation
 * Rate: ₹250 per unit
 */
export function calculateWelding(count: number, ratePerUnit: number = 250): {
  count: number;
  ratePerUnit: number;
  total: number;
} {
  const safeCount = Math.max(0, Number(count) || 0);
  const safeRate = Number(ratePerUnit) || 250;
  return {
    count: safeCount,
    ratePerUnit: safeRate,
    total: parseFloat((safeCount * safeRate).toFixed(2)),
  };
}

/**
 * 4. Recutting Auto-Calculation
 * Rate: ₹140 per unit
 */
export function calculateRecutting(count: number, ratePerUnit: number = 140): {
  count: number;
  ratePerUnit: number;
  total: number;
} {
  const safeCount = Math.max(0, Number(count) || 0);
  const safeRate = Number(ratePerUnit) || 140;
  return {
    count: safeCount,
    ratePerUnit: safeRate,
    total: parseFloat((safeCount * safeRate).toFixed(2)),
  };
}

/**
 * 5. PVC Casing Calculation
 */
export function calculatePvcCasing(feet: number, rate: number = 0): {
  feet: number;
  rate: number;
  total: number;
} {
  const safeFeet = Math.max(0, Number(feet) || 0);
  const safeRate = Math.max(0, Number(rate) || 0);
  return {
    feet: safeFeet,
    rate: safeRate,
    total: parseFloat((safeFeet * safeRate).toFixed(2)),
  };
}

/**
 * 6. Rebore Calculation
 */
export function calculateRebore(feet: number, rate: number = 0): {
  feet: number;
  rate: number;
  total: number;
} {
  const safeFeet = Math.max(0, Number(feet) || 0);
  const safeRate = Math.max(0, Number(rate) || 0);
  return {
    feet: safeFeet,
    rate: safeRate,
    total: parseFloat((safeFeet * safeRate).toFixed(2)),
  };
}

/**
 * 7. Diesel Total Calculation
 */
export function calculateDiesel(liters: number, ratePerLiter: number = 0): {
  liters: number;
  ratePerLiter: number;
  totalCost: number;
} {
  const safeLiters = Math.max(0, Number(liters) || 0);
  const safeRate = Math.max(0, Number(ratePerLiter) || 0);
  return {
    liters: safeLiters,
    ratePerLiter: safeRate,
    totalCost: parseFloat((safeLiters * safeRate).toFixed(2)),
  };
}

/**
 * 8. RPM Machinery Calculations
 */
export function calculateRpm(sRpm: number = 0, runRpm: number = 0, cRpm: number = 0): {
  sRpm: number;
  runRpm: number;
  cRpm: number;
  avgRpm: number;
} {
  const s = Number(sRpm) || 0;
  const run = Number(runRpm) || 0;
  const c = Number(cRpm) || 0;
  // Calculate average operating RPM based on available operational figures
  let avg = 0;
  if (run > 0 && c > 0) {
    avg = (run + c) / 2;
  } else if (run > 0) {
    avg = run;
  } else if (c > 0) {
    avg = c;
  } else {
    avg = s;
  }

  return {
    sRpm: s,
    runRpm: run,
    cRpm: c,
    avgRpm: parseFloat(avg.toFixed(1)),
  };
}

/**
 * 9. Comprehensive Financial Reconciliation
 * Gross Bore Cost = (depth * bRate) + msCasingTotal + pvcCasingTotal + weldingTotal + recuttingTotal + reboreTotal + flushingTotal
 * Balance Due = Gross Bore Cost - cashReceived
 */
export interface BoreFinancialsInput {
  depth: number;
  bRate: number;
  msCasingTotal: number;
  pvcCasingTotal: number;
  weldingTotal: number;
  recuttingTotal: number;
  reboreTotal: number;
  flushingTotal: number;
  cashReceived: number;
}

export interface BoreFinancialsOutput {
  drillingBaseCost: number;
  casingAndOperationsCost: number;
  grossBoreCost: number;
  cashReceived: number;
  balanceDue: number;
}

export function calculateFinancialSummary(input: BoreFinancialsInput): BoreFinancialsOutput {
  const depth = Math.max(0, Number(input.depth) || 0);
  const bRate = Math.max(0, Number(input.bRate) || 120);
  const drillingBaseCost = parseFloat((depth * bRate).toFixed(2));

  const msTotal = Math.max(0, Number(input.msCasingTotal) || 0);
  const pvcTotal = Math.max(0, Number(input.pvcCasingTotal) || 0);
  const weldingTotal = Math.max(0, Number(input.weldingTotal) || 0);
  const recuttingTotal = Math.max(0, Number(input.recuttingTotal) || 0);
  const reboreTotal = Math.max(0, Number(input.reboreTotal) || 0);
  const flushingTotal = Math.max(0, Number(input.flushingTotal) || 0);

  const casingAndOperationsCost = parseFloat(
    (msTotal + pvcTotal + weldingTotal + recuttingTotal + reboreTotal + flushingTotal).toFixed(2)
  );

  const grossBoreCost = parseFloat((drillingBaseCost + casingAndOperationsCost).toFixed(2));
  const cashReceived = Math.max(0, Number(input.cashReceived) || 0);
  const balanceDue = parseFloat((grossBoreCost - cashReceived).toFixed(2));

  return {
    drillingBaseCost,
    casingAndOperationsCost,
    grossBoreCost,
    cashReceived,
    balanceDue,
  };
}
