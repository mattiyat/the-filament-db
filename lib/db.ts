'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { count, eq, ilike, or } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import {
  filaments,
  filamentProfiles,
  filamentBrands,
  filamentMaterials,
  printers,
  printerBrands
} from './schema';
import * as schema from './schema';
export const db = drizzle(neon(process.env.POSTGRES_URL!), { schema });

// Print profile object type
export type SelectFilamentProfile = {
  filamentProfileId: string;
  filamentProfileName: string;
  brandName: string;
  materialName: string;
  color: string | null;
  diameter: number | null;
  spoolWeight?: number | null;
  filamentDensity?: number | null;
  costPerKg?: number | null;
  printerId: string | null;
  printerBrandName: string | null;
  printerModelName: string | null;
  communityRating: number;
  createdAt: string;
};

// Query to fetch filament profiles
export async function getFilamentProfiles(
  search: string,
  offset: number
): Promise<{
  filamentProfiles: {
    filamentProfileId: string;
    filamentProfileName: string;
    brandName: string;
    materialName: string;
    color: string | null;
    diameter: number | null;
    spoolWeight?: number | null;
    filamentDensity?: number | null;
    costPerKg?: number | null;
    printerId: string | null;
    printerBrandName: string | null;
    printerModelName: string | null;
    communityRating: number;
    createdAt: string;
  }[];
  newOffset: number | null;
  totalFilamentProfiles: number;
}> {
  const limit = 5;

  // Build the query dynamically based on `search`
  const query = db
    .select({
      filamentProfileId: filamentProfiles.filamentProfileId,
      filamentProfileName: filamentProfiles.filamentProfileName,
      brandName: filamentBrands.name,
      materialName: filamentMaterials.name,
      color: filaments.color,
      diameter: filaments.diameter,
      spoolWeight: filaments.spoolWeight,
      filamentDensity: filaments.filamentDensity,
      costPerKg: filaments.costPerKg,
      printerId: filamentProfiles.printerId,
      printerBrandName: printerBrands.name,
      printerModelName: printers.modelName,
      communityRating: filamentProfiles.communityRating,
      createdAt: filamentProfiles.submissionDate
    })
    .from(filamentProfiles)
    .innerJoin(filaments, eq(filamentProfiles.filamentId, filaments.filamentId))
    .innerJoin(filamentBrands, eq(filaments.brandId, filamentBrands.brandId))
    .innerJoin(
      filamentMaterials,
      eq(filaments.materialId, filamentMaterials.materialId)
    )
    .leftJoin(printers, eq(filamentProfiles.printerId, printers.printerId))
    .leftJoin(printerBrands, eq(printers.brandId, printerBrands.brandId))
    .where(
      search
        ? or(
            ilike(filamentBrands.name, `%${search}%`),
            ilike(filamentMaterials.name, `%${search}%`)
          )
        : undefined
    ) // ✅ If no search, `.where()` is skipped
    .orderBy(filamentProfiles.submissionDate)
    .limit(limit)
    .offset(offset);

  // Fetch paginated results
  const results = await query;

  // Ensure proper type conversion
  const formattedProfiles = results.map((result) => ({
    filamentProfileId: result.filamentProfileId,
    filamentProfileName: result.filamentProfileName,
    brandName: String(result.brandName),
    materialName: String(result.materialName),
    color: result.color ?? null,
    diameter: result.diameter ? Number(result.diameter) : null, // ✅ Convert to number
    spoolWeight: result.spoolWeight ? Number(result.spoolWeight) : null, // ✅ Convert to number
    filamentDensity: result.filamentDensity
      ? Number(result.filamentDensity)
      : null, // ✅ Convert to number
    costPerKg: result.costPerKg ? Number(result.costPerKg) : null, // ✅ Convert to number
    printerId: result.printerId ?? null,
    printerBrandName: result.printerBrandName
      ? String(result.printerBrandName)
      : null,
    printerModelName: result.printerModelName
      ? String(result.printerModelName)
      : null,
    communityRating: result.communityRating
      ? Number(result.communityRating)
      : 0, // ✅ Convert to number
    createdAt: result.createdAt
      ? new Date(result.createdAt).toISOString()
      : new Date().toISOString()
  }));

  // Get total count of profiles
  const totalFilamentProfiles = search
    ? formattedProfiles.length
    : Number(
        (await db.select({ count: count() }).from(filamentProfiles))[0].count
      );

  return {
    filamentProfiles: formattedProfiles,
    newOffset:
      offset !== null && formattedProfiles.length >= limit
        ? offset + limit
        : null,
    totalFilamentProfiles
  };
}

export async function addFilamentProfileToDB({
  userId,
  filamentId,
  printerId,
  filamentProfileName,
  clonedFromProfileId,
  slicerSettings = {} // 👈 Slicer settings passed here
}: {
  userId: string;
  filamentId: string;
  printerId?: string | null;
  filamentProfileName: string;
  clonedFromProfileId?: string | null;
  slicerSettings?: Partial<{
    sourceSlicer:
      | 'Bambu Studio'
      | 'PrusaSlicer'
      | 'Cura'
      | 'OrcaSlicer'
      | 'Other';
    slicerVersion: string;
    customNotes: string | null;
    communityRating: number;
    layerHeight: number;
    wallThickness: number;
    topBottomLayers: number;
    infillDensity: number;
    infillPattern: 'Grid' | 'Gyroid' | 'Honeycomb' | 'Cubic' | 'Other';
    nozzleTemp: number;
    bedTemp: number;
    chamberTemp: number;
    printSpeed: number;
    wallSpeed: number;
    infillSpeed: number;
    travelSpeed: number;
    flowRate: number;
    fanSpeed: number;
    minLayerTime: number;
    retractionDistance: number;
    retractionSpeed: number;
    zHop: number;
    supportsEnabled: boolean;
    supportType: 'Tree' | 'Grid' | 'None';
    supportDensity: number;
    supportZDistance: number;
    gcodeLink: string;
    profileLink: string;
    tags: string[];
  }>;
}) {
  try {
    // ✅ Extract only valid columns that exist in the filamentProfiles schema
    const validSlicerSettings = Object.fromEntries(
      Object.entries(slicerSettings).filter(([key]) =>
        Object.keys(filamentProfiles).includes(key)
      )
    );

    const [newFilamentProfile] = await db
      .insert(filamentProfiles)
      .values({
        userId,
        filamentId,
        printerId: printerId ?? null,
        filamentProfileName,
        clonedFromProfileId: clonedFromProfileId ?? null,
        ...validSlicerSettings // ✅ Ensures only valid keys are inserted
      })
      .returning();

    return newFilamentProfile;
  } catch (error) {
    console.error('Error adding filament profile:', error);
    throw new Error('Failed to add filament profile');
  }
}

export async function deleteFilamentProfileById(id: string) {
  await db.delete(filaments).where(eq(filaments.filamentId, id));
}
