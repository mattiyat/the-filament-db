# System Patterns

## Database Schema (PostgreSQL)

```sql
-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (To track who submits profiles)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT now()
);

-- Filament Brands Table (For fast search filtering)
CREATE TABLE filament_brands (
    brand_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Filament Materials Table (PLA, PETG, etc.)
CREATE TABLE filament_materials (
    material_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Filaments Table (Represents actual filament rolls)
CREATE TABLE filaments (
    filament_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id INT REFERENCES filament_brands(brand_id) ON DELETE CASCADE,
    material_id INT REFERENCES filament_materials(material_id) ON DELETE CASCADE,
    color TEXT, -- Optional
    diameter NUMERIC(4,2) CHECK (diameter IN (1.75, 2.85)), -- Standard diameters
    spool_weight NUMERIC(5,2), -- KG
    filament_density NUMERIC(5,2), -- g/cm³
    cost_per_kg NUMERIC(8,2), -- Optional pricing
    created_at TIMESTAMP DEFAULT now(),

    -- Ensuring brand & material uniqueness
    UNIQUE (brand_id, material_id, color, diameter)
);

-- Printer Brands Table
CREATE TABLE printer_brands (
    brand_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Printer Models Table
CREATE TABLE printers (
    printer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id INT REFERENCES printer_brands(brand_id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    extruder_type TEXT CHECK (extruder_type IN ('Direct Drive', 'Bowden')),
    bed_type TEXT CHECK (bed_type IN ('PEI', 'Glass', 'Textured PEI', 'Other')),
    created_at TIMESTAMP DEFAULT now(),

    UNIQUE (brand_id, model_name)
);

-- Filament Profiles Table (Users submit independent print settings for a filament-printer combo)
CREATE TABLE filament_profiles (
    filament_profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Each profile belongs to a user
    filament_id UUID REFERENCES filaments(filament_id) ON DELETE CASCADE,
    printer_id UUID REFERENCES printers(printer_id) ON DELETE CASCADE,
    filament_profile_name TEXT NOT NULL, -- Unique name per profile, but not per filament-printer
    submission_date TIMESTAMP DEFAULT now(),
    cloned_from_profile_id UUID REFERENCES filament_profiles(filament_profile_id) ON DELETE SET NULL, -- Tracks cloning but is optional
    source_slicer TEXT CHECK (source_slicer IN ('Bambu Studio', 'PrusaSlicer', 'Cura', 'OrcaSlicer', 'Other')),
    slicer_version TEXT,
    custom_notes TEXT,
    community_rating NUMERIC(3,2) CHECK (community_rating BETWEEN 0 AND 5) DEFAULT 0,

    -- General Print Settings
    layer_height NUMERIC(4,2),
    wall_thickness NUMERIC(4,2),
    top_bottom_layers INT CHECK (top_bottom_layers >= 0),
    infill_density INT CHECK (infill_density BETWEEN 0 AND 100),
    infill_pattern TEXT CHECK (infill_pattern IN ('Grid', 'Gyroid', 'Honeycomb', 'Cubic', 'Other')),

    -- Temperature Settings
    nozzle_temp INT CHECK (nozzle_temp BETWEEN 0 AND 400),
    bed_temp INT CHECK (bed_temp BETWEEN 0 AND 150),
    chamber_temp INT CHECK (chamber_temp BETWEEN 0 AND 100),

    -- Speed & Flow Settings
    print_speed NUMERIC(5,2),
    wall_speed NUMERIC(5,2),
    infill_speed NUMERIC(5,2),
    travel_speed NUMERIC(5,2),
    flow_rate INT CHECK (flow_rate BETWEEN 0 AND 150),

    -- Cooling
    fan_speed INT CHECK (fan_speed BETWEEN 0 AND 100),
    min_layer_time NUMERIC(5,2),

    -- Retraction Settings
    retraction_distance NUMERIC(5,2),
    retraction_speed NUMERIC(5,2),
    z_hop NUMERIC(5,2),

    -- Support Settings
    supports_enabled BOOLEAN DEFAULT FALSE,
    support_type TEXT CHECK (support_type IN ('Tree', 'Grid', 'None')),
    support_density INT CHECK (support_density BETWEEN 0 AND 100),
    support_z_distance NUMERIC(4,2),

    -- Additional Metadata
    gcode_link TEXT, -- Optional
    profile_link TEXT, -- Optional
    tags TEXT[] -- Array of searchable tags
);

-- Likes Table (Tracks user likes for filament profiles)
CREATE TABLE profile_likes (
    like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    filament_profile_id UUID REFERENCES filament_profiles(filament_profile_id) ON DELETE CASCADE,
    liked_at TIMESTAMP DEFAULT now(),
    
    -- Ensuring each user can only like a profile once
    UNIQUE (user_id, filament_profile_id)
);

-- Indexed Searches for Performance
CREATE INDEX idx_filament_search ON filaments (brand_id, material_id);
CREATE INDEX idx_printer_search ON printers (brand_id, model_name);
CREATE INDEX idx_filament_profile_search ON filament_profiles (filament_id, printer_id, filament_profile_name);
CREATE INDEX idx_filament_profile_likes ON profile_likes (filament_profile_id);
