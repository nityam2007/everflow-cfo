import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { formatDate } from '@/lib/utils';

// GET - Export leads as CSV (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const eligibility = searchParams.get('eligibility');

  // Build filters
  const where: Record<string, unknown> = {};
  if (status && status !== 'all') where.status = status;
  if (eligibility && eligibility !== 'all') where.eligibility = eligibility;

  const leads = await db.lead.findMany({
    where,
    include: {
      assignedStaff: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert to CSV
  const headers = [
    'ID',
    'Business Name',
    'Contact Name',
    'Email',
    'Phone',
    'Industry',
    'Status',
    'Eligibility',
    'Estimated Min',
    'Estimated Max',
    'Credit Flags',
    'Assigned Staff',
    'Source',
    'Created At',
  ];

  const rows = leads.map((lead) => [
    lead.id,
    escapeCSV(lead.companyName),
    escapeCSV(lead.contactName),
    lead.email,
    lead.phone || '',
    lead.industry || '',
    lead.status,
    lead.eligibility,
    lead.estimatedMin.toString(),
    lead.estimatedMax.toString(),
    escapeCSV(lead.creditFlags.join(', ')),
    lead.assignedStaff?.name || '',
    lead.source || 'estimator',
    formatDate(lead.createdAt),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create audit log
  await db.auditLog.create({
    data: {
      action: 'LEAD_UPDATED',
      entityType: 'LEAD',
      entityId: 'bulk-export',
      userId: session.user.id,
      newValues: {
        count: leads.length,
        filters: { status, eligibility },
        exportType: 'csv',
      },
    },
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
