import { sql, SQL } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';
import {
  pgTable,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  primaryKey,
  type AnyPgColumn,
  pgEnum,
  serial,
  uuid,
  uniqueIndex
} from 'drizzle-orm/pg-core';

// Enums
export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const roleEnum = pgEnum('role', ['user', 'admin']);

// Custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}
// Users table
export const users = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email'),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    role: roleEnum('role').notNull().default('user')
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex('emailUniqueIndex').on(lower(table.email))
  })
);

// Accounts table
export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
);

// Verification Tokens table
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull()
  },
  (vt) => ({
    compositePk: primaryKey(vt.identifier, vt.token)
  })
);

// Sessions table
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull()
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
  brandId: integer('brand_id').references(() => filamentBrands.brandId, {
    onDelete: 'cascade'
  }),
  materialId: integer('material_id').references(
    () => filamentMaterials.materialId,
    { onDelete: 'cascade' }
  ),
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
  brandId: integer('brand_id').references(() => printerBrands.brandId, {
    onDelete: 'cascade'
  }),
  modelName: text('model_name').notNull(),
  extruderType: text('extruder_type'),
  bedType: text('bed_type'),
  createdAt: timestamp('created_at').defaultNow()
});

export const filamentProfiles = pgTable('filament_profiles', {
  filamentProfileId: uuid('filament_profile_id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, {
    onDelete: 'set null'
  }),
  filamentId: uuid('filament_id').references(() => filaments.filamentId, {
    onDelete: 'cascade'
  }),
  printerId: uuid('printer_id').references(() => printers.printerId, {
    onDelete: 'cascade'
  }),
  filamentProfileName: text('filament_profile_name').notNull(),
  submissionDate: timestamp('submission_date').defaultNow(),
  clonedFromProfileId: uuid('cloned_from_profile_id'),
  sourceSlicer: text('source_slicer').$type<
    'Bambu Studio' | 'PrusaSlicer' | 'Cura' | 'OrcaSlicer' | 'Other'
  >(),
  slicerVersion: text('slicer_version'),
  customNotes: text('custom_notes'),
  communityRating: numeric('community_rating', {
    precision: 3,
    scale: 2
  }).default('0'),

  // General Print Settings
  layerHeight: numeric('layer_height', { precision: 4, scale: 2 }),
  wallThickness: numeric('wall_thickness', { precision: 4, scale: 2 }),
  topBottomLayers: integer('top_bottom_layers'),
  infillDensity: integer('infill_density'),
  infillPattern: text('infill_pattern').$type<
    'Grid' | 'Gyroid' | 'Honeycomb' | 'Cubic' | 'Other'
  >(),

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
  retractionDistance: numeric('retraction_distance', {
    precision: 5,
    scale: 2
  }),
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
  tags: text('tags').array()
});

export const profileLikes = pgTable('profile_likes', {
  likeId: uuid('like_id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, {
    onDelete: 'cascade'
  }),
  profileId: uuid('profile_id').references(
    () => filamentProfiles.filamentProfileId,
    { onDelete: 'cascade' }
  ),
  likedAt: timestamp('liked_at').defaultNow()
});

// function primaryKey(
//   identifier: ExtraConfigColumn<ColumnBaseConfig<ColumnDataType, string>>,
//   token: ExtraConfigColumn<ColumnBaseConfig<ColumnDataType, string>>
// ):
//   | import('drizzle-orm/pg-core').AnyIndexBuilder
//   | import('drizzle-orm/pg-core').CheckBuilder
//   | import('drizzle-orm/pg-core').ForeignKeyBuilder
//   | import('drizzle-orm/pg-core').PrimaryKeyBuilder
//   | import('drizzle-orm/pg-core').UniqueConstraintBuilder {
//   throw new Error('Function not implemented.');
// }
