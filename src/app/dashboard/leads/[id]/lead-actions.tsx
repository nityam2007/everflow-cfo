'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface LeadActionsProps {
  leadId: string;
  currentStatus: string;
  assignedStaffId: string | null;
  staffList: { id: string; name: string; email: string }[];
  isAdmin: boolean;
}

const statusOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'LOST', label: 'Lost' },
];

export function LeadActions({
  leadId,
  currentStatus,
  assignedStaffId,
  staffList,
  isAdmin,
}: LeadActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [staffId, setStaffId] = useState(assignedStaffId || '');

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    startTransition(async () => {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    });
  }

  async function assignStaff(newStaffId: string) {
    setStaffId(newStaffId);
    startTransition(async () => {
      await fetch(`/api/leads/${leadId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: newStaffId }),
      });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status update */}
        <div>
          <label className="text-sm text-[var(--color-foreground-muted)] mb-2 block">Status</label>
          <Select value={status} onValueChange={updateStatus} disabled={isPending}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Staff assignment (admin only) */}
        {isAdmin && staffList.length > 0 && (
          <div>
            <label className="text-sm text-[var(--color-foreground-muted)] mb-2 block">Assign To</label>
            <Select value={staffId} onValueChange={assignStaff} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
