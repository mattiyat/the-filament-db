'use server';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilamentProfilesTable } from './filament-profiles-table';
import { getFilamentProfiles } from '@/lib/db';
import { AddFilamentProfileDialog } from '@/app/(dashboard)/add-filament-profile-dialog';

export default async function FilamentsPage(
  props: {
    searchParams: Promise<{ q: string; offset: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const { filamentProfiles, newOffset, totalFilamentProfiles } = await getFilamentProfiles(
    search,
    Number(offset)
  );

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pla">PLA</TabsTrigger>
          <TabsTrigger value="petg">PETG</TabsTrigger>
          <TabsTrigger value="abs" className="hidden sm:flex">
            ABS
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <AddFilamentProfileDialog /> {/* ✅ Use Dialog for adding a profile */}
        </div>
      </div>
      <TabsContent value="all">
        <FilamentProfilesTable
          filamentProfiles={filamentProfiles}
          offset={newOffset ?? 0}
          totalFilamentProfiles={totalFilamentProfiles}
        />
      </TabsContent>
    </Tabs>
  );
}
