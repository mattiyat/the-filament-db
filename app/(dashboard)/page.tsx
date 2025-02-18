import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilamentProfilesTable } from './filament-profiles-table';
import { getFilamentProfiles } from '@/lib/db';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function AddFilamentProfileDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Filament Profile
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Filament Profile</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new filament profile.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profileName" className="text-right">
              Name
            </Label>
            <Input id="profileName" placeholder="Enter profile name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sourceSlicer" className="text-right">
              Slicer
            </Label>
            <Input id="sourceSlicer" placeholder="Enter slicer type" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save</Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
