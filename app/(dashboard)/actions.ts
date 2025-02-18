'use server';

import { addFilamentProfileToDB, deleteFilamentProfileById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addFilamentProfile(formData: FormData) {
  const userId = formData.get('userId') as string;
  const filamentId = formData.get('filamentId') as string;
  const printerId = formData.get('printerId') as string | null;
  const filamentProfileName = formData.get('filamentProfileName') as string;
  const clonedFromProfileId = formData.get('clonedFromProfileId') as string | null;

  if (!userId || !filamentId || !filamentProfileName) {
    throw new Error('Missing required filament profile data');
  }
// ✅ Explicitly cast slicerSettings to match the expected type
const slicerSettings: Partial<{
  sourceSlicer: 'Bambu Studio' | 'PrusaSlicer' | 'Cura' | 'OrcaSlicer' | 'Other';
  slicerVersion: string;
  customNotes: string | null;
  communityRating?: number;
  layerHeight?: number;
  wallThickness?: number;
  topBottomLayers?: number;
  infillDensity?: number;
  infillPattern: 'Grid' | 'Gyroid' | 'Honeycomb' | 'Cubic' | 'Other';
  nozzleTemp?: number;
  bedTemp?: number;
  chamberTemp?: number;
  printSpeed?: number;
  wallSpeed?: number;
  infillSpeed?: number;
  travelSpeed?: number;
  flowRate?: number;
  fanSpeed?: number;
  minLayerTime?: number;
  retractionDistance?: number;
  retractionSpeed?: number;
  zHop?: number;
  supportsEnabled?: boolean;
  supportType?: 'Tree' | 'Grid' | 'None';
  supportDensity?: number;
  supportZDistance?: number;
  gcodeLink?: string;
  profileLink?: string;
  tags?: string[];
}> = {
  sourceSlicer: formData.get('sourceSlicer') ? (formData.get('sourceSlicer') as 'Bambu Studio' | 'PrusaSlicer' | 'Cura' | 'OrcaSlicer' | 'Other') : undefined,
  slicerVersion: formData.get('slicerVersion') ? (formData.get('slicerVersion') as string) : undefined,
  customNotes: formData.get('customNotes') ? (formData.get('customNotes') as string) : undefined,
  communityRating: formData.get('communityRating') ? parseFloat(formData.get('communityRating') as string) : undefined,
  layerHeight: formData.get('layerHeight') ? parseFloat(formData.get('layerHeight') as string) : undefined,
  wallThickness: formData.get('wallThickness') ? parseFloat(formData.get('wallThickness') as string) : undefined,
  topBottomLayers: formData.get('topBottomLayers') ? parseInt(formData.get('topBottomLayers') as string) : undefined,
  infillDensity: formData.get('infillDensity') ? parseInt(formData.get('infillDensity') as string) : undefined,
  infillPattern: formData.get('infillPattern') ? (formData.get('infillPattern') as 'Grid' | 'Gyroid' | 'Honeycomb' | 'Cubic' | 'Other') : undefined,
  nozzleTemp: formData.get('nozzleTemp') ? parseInt(formData.get('nozzleTemp') as string) : undefined,
  bedTemp: formData.get('bedTemp') ? parseInt(formData.get('bedTemp') as string) : undefined,
  chamberTemp: formData.get('chamberTemp') ? parseInt(formData.get('chamberTemp') as string) : undefined,
  printSpeed: formData.get('printSpeed') ? parseFloat(formData.get('printSpeed') as string) : undefined,
  wallSpeed: formData.get('wallSpeed') ? parseFloat(formData.get('wallSpeed') as string) : undefined,
  infillSpeed: formData.get('infillSpeed') ? parseFloat(formData.get('infillSpeed') as string) : undefined,
  travelSpeed: formData.get('travelSpeed') ? parseFloat(formData.get('travelSpeed') as string) : undefined,
  flowRate: formData.get('flowRate') ? parseInt(formData.get('flowRate') as string) : undefined,
  fanSpeed: formData.get('fanSpeed') ? parseInt(formData.get('fanSpeed') as string) : undefined,
  minLayerTime: formData.get('minLayerTime') ? parseFloat(formData.get('minLayerTime') as string) : undefined,
  retractionDistance: formData.get('retractionDistance') ? parseFloat(formData.get('retractionDistance') as string) : undefined,
  retractionSpeed: formData.get('retractionSpeed') ? parseFloat(formData.get('retractionSpeed') as string) : undefined,
  zHop: formData.get('zHop') ? parseFloat(formData.get('zHop') as string) : undefined,
  supportsEnabled: formData.get('supportsEnabled') === 'true' ? true : undefined,
  supportType: formData.get('supportType') ? (formData.get('supportType') as 'Tree' | 'Grid' | 'None') : undefined,
  supportDensity: formData.get('supportDensity') ? parseInt(formData.get('supportDensity') as string) : undefined,
  supportZDistance: formData.get('supportZDistance') ? parseFloat(formData.get('supportZDistance') as string) : undefined,
  gcodeLink: formData.get('gcodeLink') ? (formData.get('gcodeLink') as string) : undefined,
  profileLink: formData.get('profileLink') ? (formData.get('profileLink') as string) : undefined,
  tags: formData.get('tags') ? (formData.get('tags') as string).split(',') : undefined,
};

// ✅ Now TypeScript will not complain about `null`
await addFilamentProfileToDB({
  userId,
  filamentId,
  printerId,
  filamentProfileName,
  clonedFromProfileId,
  slicerSettings,
});

  

  revalidatePath('/');
}

export async function deleteFilamentProfile(formData: FormData) {
  const filamentProfileId = formData.get('id') as string;

  if (!filamentProfileId) {
    throw new Error('Invalid filament profile ID');
  }

  await deleteFilamentProfileById(filamentProfileId);
  revalidatePath('/');
}

