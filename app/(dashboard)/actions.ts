'use server';

import { addFilamentProfileToDB, deleteFilamentProfileById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addFilamentProfile(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const manufacturer = formData.get('manufacturer') as string;
  const diameter = Number(formData.get('diameter'));
  const color = formData.get('color') as string;
  
  if (!name || !type || !manufacturer || isNaN(diameter)) {
    throw new Error('Missing required filament profile data');
  }

  await addFilamentProfileToDB({ name, type, manufacturer, diameter, color });
  revalidatePath('/');
}

export async function deleteFilamentProfile(formData: FormData) {
  const id = Number(formData.get('id'));

  if (isNaN(id)) {
    throw new Error('Invalid filament profile ID');
  }

  await deleteFilamentProfileById(id);
  revalidatePath('/');
}
