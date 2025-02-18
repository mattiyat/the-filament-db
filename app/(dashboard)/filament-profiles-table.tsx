'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { FilamentProfile } from './filament-profile';
import { SelectFilamentProfile } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FilamentProfilesTable({
  filamentProfiles,
  offset,
  totalFilamentProfiles
}: {
  filamentProfiles: SelectFilamentProfile[];
  offset: number;
  totalFilamentProfiles: number;
}) {
  let router = useRouter();
  let filamentsPerPage = 5;

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/?offset=${offset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filament Profiles</CardTitle>
        <CardDescription>
          Browse and manage filament print profiles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="hidden md:table-cell">Diameter</TableHead>
              <TableHead className="hidden md:table-cell">Color</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filamentProfiles.map((filamentProfile) => (
              <FilamentProfile key={filamentProfile.filamentProfileId} filamentProfile={filamentProfile} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.max(0, Math.min(offset - filamentsPerPage, totalFilamentProfiles) + 1)}-{offset}
            </strong>{' '}
            of <strong>{totalFilamentProfiles}</strong> filaments
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset === filamentsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + filamentsPerPage > totalFilamentProfiles}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
