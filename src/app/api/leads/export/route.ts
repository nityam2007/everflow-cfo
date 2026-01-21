import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth-utils';
import { formatDate } from '@/lib/utils';
import { cache } from '@/lib/redis';
import { 
  sanitizeString, 
  rateLimits, 
  secureErrorResponse,
  addSecurityHeaders 
} from '@/lib/security';

// GET - Export leads as CSV (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return secureErrorResponse('Unauthorized', 401);
  }

  // Rate limit exports (resource-intensive operation)
  const rateKey = `rate:export:${session.user.id}`;
  const { allowed, remaining } = await cache.rateLimit(
    rateKey,
    rateLimits.export.maxRequests,
    Math.floor(rateLimits.export.windowMs / 1000)
  );

  if (!allowed) {
    const response = secureErrorResponse('Export rate limit exceeded. Try again later.', 429);
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const eligibility = searchParams.get('eligibility');

  // Sanitize filter values
  const sanitizedStatus = status ? sanitizeString(status) : null;
  const sanitizedEligibility = eligibility ? sanitizeString(eligibility) : null;

  // Build filters
  const where: Record<string, unknown> = {};
  if (sanitizedStatus && sanitizedStatus !== 'all') where.status = sanitizedStatus;
  if (sanitizedEligibility && sanitizedEligibility !== 'all') where.eligibility = sanitizedEligibility;

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
        filters: { status: sanitizedStatus, eligibility: sanitizedEligibility },
        exportType: 'csv',
      },
    },
  });

  const response = new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
  
  return addSecurityHeaders(response);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
