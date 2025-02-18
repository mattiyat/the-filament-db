import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectFilamentProfile } from '@/lib/db';
// import { deleteFilamentProfile } from './actions';

export function FilamentProfile({ filamentProfile }: { filamentProfile: SelectFilamentProfile } ) {
  return (
    <TableRow>
      <TableCell className="font-medium">{filamentProfile.brandName} {filamentProfile.materialName}</TableCell>
      <TableCell>{filamentProfile.color}</TableCell>
      <TableCell>{filamentProfile.diameter}mm</TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="outline" className="capitalize">
          {filamentProfile.communityRating !== undefined ? `${filamentProfile.communityRating} ⭐` : 'N/A'}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {filamentProfile.createdAt ? new Date(filamentProfile.createdAt).toLocaleDateString("en-US") : 'N/A'}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>
              {/* <form action={deleteFilamentProfile}>
                <button type="submit">Delete</button>
              </form> */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
