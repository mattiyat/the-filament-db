'use client';

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
import { useState } from 'react';
import { addFilamentProfile } from '@/app/(dashboard)/actions';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function AddFilamentProfileDialog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      await addFilamentProfile(formData);
    } catch (err) {
      setError('Failed to add filament profile');
    } finally {
      setLoading(false);
    }
  }

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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filamentProfileName" className="text-right">
              Name
            </Label>
            <Input id="filamentProfileName" name="filamentProfileName" placeholder="Enter profile name" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userId" className="text-right">
              User ID
            </Label>
            <Input id="userId" name="userId" placeholder="Enter user ID" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filamentId" className="text-right">
              Filament ID
            </Label>
            <Input id="filamentId" name="filamentId" placeholder="Enter filament ID" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sourceSlicer" className="text-right">
              Slicer
            </Label>
            <Input id="sourceSlicer" name="sourceSlicer" placeholder="Enter slicer type" className="col-span-3" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
