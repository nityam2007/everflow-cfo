'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
}

export default function EditPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function fetchPartner() {
      try {
        const res = await fetch(`/api/partners/${partnerId}`);
        if (!res.ok) throw new Error('Partner not found');
        const data = await res.json();
        setPartner(data);
        setName(data.name);
        setCompanyName(data.companyName);
        setEmail(data.email);
        setPhone(data.phone || '');
        setIsActive(data.isActive);
      } catch {
        setError('Failed to load partner');
      } finally {
        setLoading(false);
      }
    }
    fetchPartner();
  }, [partnerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(`/api/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          companyName,
          email, 
          phone: phone || null,
          isActive 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update partner');
      }

      setSuccess('Partner updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update partner');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm('Are you sure you want to deactivate this partner? They will lose access to all assigned leads.')) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });

      if (!res.ok) throw new Error('Failed to deactivate partner');
      router.push('/dashboard/settings');
    } catch {
      setError('Failed to deactivate partner');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-foreground-muted)]" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Partner not found</p>
        <Link href="/dashboard/settings" className="text-[var(--brand-primary)] hover:underline mt-4 inline-block">
          ← Back to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Partner</h1>
          <p className="text-[var(--color-foreground-muted)]">Update partner organization details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Details</CardTitle>
          <CardDescription>
            Modify the partner organization&apos;s information below. Partners use email OTP to login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="ABC Payroll Services"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Contact Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@partner.com"
                  required
                />
                <p className="text-xs text-[var(--color-foreground-muted)]">
                  This email is used for OTP login
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={isActive ? 'active' : 'inactive'} onValueChange={(v) => setIsActive(v === 'active')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeactivate}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
              
              <div className="flex gap-3">
                <Link href="/dashboard/settings">
                  <Button type="button" variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
