import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  pgEnum,
  serial,
  uuid
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, or } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

//T
export const users = pgTable('users', {
  userId: uuid('user_id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
});

export const filamentBrands = pgTable('filament_brands', {
  brandId: serial('brand_id').primaryKey(),
  name: text('name').notNull().unique()
});

export const filamentMaterials = pgTable('filament_materials', {
  materialId: serial('material_id').primaryKey(),
  name: text('name').notNull().unique()
});

export const filaments = pgTable('filaments', {
  filamentId: uuid('filament_id').defaultRandom().primaryKey(),
  brandId: integer('brand_id').references(() => filamentBrands.brandId, { onDelete: 'cascade' }),
  materialId: integer('material_id').references(() => filamentMaterials.materialId, { onDelete: 'cascade' }),
  color: text('color'),
  diameter: numeric('diameter', { precision: 4, scale: 2 }),
  spoolWeight: numeric('spool_weight', { precision: 5, scale: 2 }),
  filamentDensity: numeric('filament_density', { precision: 5, scale: 2 }),
  costPerKg: numeric('cost_per_kg', { precision: 8, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const printerBrands = pgTable('printer_brands', {
  brandId: serial('brand_id').primaryKey(),
  name: text('name').notNull().unique()
});

export const printers = pgTable('printers', {
  printerId: uuid('printer_id').defaultRandom().primaryKey(),
  brandId: integer('brand_id').references(() => printerBrands.brandId, { onDelete: 'cascade' }),
  modelName: text('model_name').notNull(),
  extruderType: text('extruder_type'),
  bedType: text('bed_type'),
  createdAt: timestamp('created_at').defaultNow()
});

export const filamentProfiles = pgTable('filament_profiles', {
  filamentProfileId: uuid('filament_profile_id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.userId, { onDelete: 'set null' }),
  filamentId: uuid('filament_id').references(() => filaments.filamentId, { onDelete: 'cascade' }),
  printerId: uuid('printer_id').references(() => printers.printerId, { onDelete: 'cascade' }),
  filamentProfileName: text('filament_profile_name').notNull(),
  submissionDate: timestamp('submission_date').defaultNow(),
  clonedFromProfileId: uuid('cloned_from_profile_id'),
  sourceSlicer: text('source_slicer').$type<'Bambu Studio' | 'PrusaSlicer' | 'Cura' | 'OrcaSlicer' | 'Other'>(),
  slicerVersion: text('slicer_version'),
  customNotes: text('custom_notes'),
  communityRating: numeric('community_rating', { precision: 3, scale: 2 }).default('0'),

  // General Print Settings
  layerHeight: numeric('layer_height', { precision: 4, scale: 2 }),
  wallThickness: numeric('wall_thickness', { precision: 4, scale: 2 }),
  topBottomLayers: integer('top_bottom_layers'),
  infillDensity: integer('infill_density'),
  infillPattern: text('infill_pattern').$type<'Grid' | 'Gyroid' | 'Honeycomb' | 'Cubic' | 'Other'>(),

  // Temperature Settings
  nozzleTemp: integer('nozzle_temp'),
  bedTemp: integer('bed_temp'),
  chamberTemp: integer('chamber_temp'),

  // Speed & Flow Settings
  printSpeed: numeric('print_speed', { precision: 5, scale: 2 }),
  wallSpeed: numeric('wall_speed', { precision: 5, scale: 2 }),
  infillSpeed: numeric('infill_speed', { precision: 5, scale: 2 }),
  travelSpeed: numeric('travel_speed', { precision: 5, scale: 2 }),
  flowRate: integer('flow_rate'),

  // Cooling
  fanSpeed: integer('fan_speed'),
  minLayerTime: numeric('min_layer_time', { precision: 5, scale: 2 }),

  // Retraction Settings
  retractionDistance: numeric('retraction_distance', { precision: 5, scale: 2 }),
  retractionSpeed: numeric('retraction_speed', { precision: 5, scale: 2 }),
  zHop: numeric('z_hop', { precision: 5, scale: 2 }),

  // Support Settings
  supportsEnabled: boolean('supports_enabled').default(false),
  supportType: text('support_type').$type<'Tree' | 'Grid' | 'None'>(),
  supportDensity: integer('support_density'),
  supportZDistance: numeric('support_z_distance', { precision: 4, scale: 2 }),

  // Additional Metadata
  gcodeLink: text('gcode_link'),
  profileLink: text('profile_link'),
  tags: text('tags').array(),
});



export const profileLikes = pgTable('profile_likes', {
  likeId: uuid('like_id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.userId, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').references(() => filamentProfiles.filamentProfileId, { onDelete: 'cascade' }),
  likedAt: timestamp('liked_at').defaultNow()
});


// export const insertFilamentSchema = createInsertSchema(filaments);

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
      createdAt: filamentProfiles.submissionDate,
    })
    .from(filamentProfiles)
    .innerJoin(filaments, eq(filamentProfiles.filamentId, filaments.filamentId))
    .innerJoin(filamentBrands, eq(filaments.brandId, filamentBrands.brandId))
    .innerJoin(filamentMaterials, eq(filaments.materialId, filamentMaterials.materialId))
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
    filamentDensity: result.filamentDensity ? Number(result.filamentDensity) : null, // ✅ Convert to number
    costPerKg: result.costPerKg ? Number(result.costPerKg) : null, // ✅ Convert to number
    printerId: result.printerId ?? null,
    printerBrandName: result.printerBrandName ? String(result.printerBrandName) : null,
    printerModelName: result.printerModelName ? String(result.printerModelName) : null,
    communityRating: result.communityRating ? Number(result.communityRating) : 0, // ✅ Convert to number
    createdAt: result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
  }));
  

  // Get total count of profiles
  const totalFilamentProfiles = search
    ? formattedProfiles.length
    : Number((await db.select({ count: count() }).from(filamentProfiles))[0].count);

  return {
    filamentProfiles: formattedProfiles,
    newOffset: offset !== null && formattedProfiles.length >= limit ? offset + limit : null,
    totalFilamentProfiles,
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
    sourceSlicer: 'Bambu Studio' | 'PrusaSlicer' | 'Cura' | 'OrcaSlicer' | 'Other';
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
        ...validSlicerSettings, // ✅ Ensures only valid keys are inserted
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
