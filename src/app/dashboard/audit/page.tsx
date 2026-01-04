import { requireAdmin } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Activity, User, Building2, FileText, Clock, Settings2, Shield, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function AuditLogPage() {
  await requireAdmin();

  const auditLogs = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: { select: { id: true, name: true, email: true } },
      partner: { select: { id: true, name: true, companyName: true } },
      lead: { select: { id: true, companyName: true } }
    }
  });

  // Count by action type
  const actionCounts = auditLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by entity type
  const entityCounts = auditLogs.reduce((acc, log) => {
    acc[log.entityType] = (acc[log.entityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const actionColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
    USER_CREATED: 'success',
    PARTNER_CREATED: 'success',
    LEAD_CREATED: 'success',
    CREATE_RULES: 'success',
    CREATE_SETTING: 'success',
    USER_LOGIN: 'secondary',
    LEAD_STATUS_CHANGED: 'warning',
    LEAD_ASSIGNED: 'default',
    LEAD_ASSIGNED_TO_PARTNER: 'default',
    PARTNER_STATUS_UPDATE: 'warning',
    LEAD_UPDATED: 'secondary',
    UPDATE_RULES: 'warning',
    UPDATE_SETTING: 'warning',
    DELETE_RULES: 'destructive',
  };

  const actionIcons: Record<string, typeof Activity> = {
    USER_CREATED: User,
    PARTNER_CREATED: Building2,
    LEAD_CREATED: FileText,
    CREATE_RULES: Settings2,
    CREATE_SETTING: Settings2,
    USER_LOGIN: User,
    LEAD_STATUS_CHANGED: Activity,
    LEAD_ASSIGNED: User,
    LEAD_ASSIGNED_TO_PARTNER: Building2,
    PARTNER_STATUS_UPDATE: Activity,
    LEAD_UPDATED: FileText,
    UPDATE_RULES: Settings2,
    UPDATE_SETTING: Settings2,
    DELETE_RULES: Settings2,
  };

  const entityLabels: Record<string, string> = {
    lead: 'Leads',
    user: 'Users',
    partner: 'Partners',
    estimator_rules: 'Rules',
    site_setting: 'Settings'
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Audit Log</h1>
            <p className="text-sm text-[var(--color-foreground-muted)]">
              Track all system activity and changes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[var(--color-foreground-muted)]">Total Events</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{auditLogs.length}</p>
              </div>
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-foreground-subtle)]" />
            </div>
          </CardContent>
        </Card>
        {Object.entries(entityCounts).slice(0, 4).map(([entity, count]) => (
          <Card key={entity}>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-[var(--color-foreground-muted)] capitalize">
                    {entityLabels[entity] || entity}
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{count}</p>
                </div>
                {entity === 'user' && <User className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-foreground-subtle)]" />}
                {entity === 'partner' && <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-foreground-subtle)]" />}
                {entity === 'lead' && <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-foreground-subtle)]" />}
                {entity.includes('rule') && <Settings2 className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-foreground-subtle)]" />}
                {entity.includes('setting') && <Settings2 className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-foreground-subtle)]" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Type Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity by Type</CardTitle>
          <CardDescription>Breakdown of logged actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(actionCounts).map(([action, count]) => (
              <Badge 
                key={action} 
                variant={actionColors[action] || 'default'}
                className="text-sm py-1 px-3"
              >
                {formatActionName(action)}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last {auditLogs.length} events</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-[var(--color-foreground-subtle)]" />
              <p className="mt-4 text-[var(--color-foreground-muted)]">No activity logged yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => {
                const Icon = actionIcons[log.action] || Activity;
                const performer = log.user?.name || log.partner?.companyName || 'System';
                
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] p-4 hover:bg-[var(--color-background-alt)] transition-colors"
                  >
                    <div className={`rounded-full p-2 ${
                      log.action.includes('CREATE') ? 'bg-emerald-100' :
                      log.action.includes('DELETE') ? 'bg-red-100' :
                      log.action.includes('UPDATE') || log.action.includes('CHANGE') ? 'bg-amber-100' :
                      'bg-slate-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        log.action.includes('CREATE') ? 'text-emerald-600' :
                        log.action.includes('DELETE') ? 'text-red-600' :
                        log.action.includes('UPDATE') || log.action.includes('CHANGE') ? 'text-amber-600' :
                        'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={actionColors[log.action] || 'default'}>
                          {formatActionName(log.action)}
                        </Badge>
                        <span className="text-sm text-[var(--color-foreground-muted)]">
                          {log.entityType}
                        </span>
                        {log.lead && (
                          <Link 
                            href={`/dashboard/leads/${log.lead.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {log.lead.companyName}
                          </Link>
                        )}
                        {!log.lead && (
                          <code className="text-xs bg-[var(--color-background-alt)] px-1 rounded">
                            #{log.entityId.slice(0, 8)}
                          </code>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-[var(--color-foreground-muted)]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(log.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {performer}
                        </span>
                      </div>
                      {/* Show old/new values if available */}
                      {(log.oldValues || log.newValues) && (
                        <div className="mt-2 text-xs grid grid-cols-2 gap-2">
                          {log.oldValues && (
                            <div className="bg-red-50 p-2 rounded">
                              <span className="text-red-600 font-medium">Before: </span>
                              <span className="text-[var(--color-foreground-muted)]">
                                {JSON.stringify(log.oldValues).slice(0, 50)}
                                {JSON.stringify(log.oldValues).length > 50 && '...'}
                              </span>
                            </div>
                          )}
                          {log.newValues && (
                            <div className="bg-emerald-50 p-2 rounded">
                              <span className="text-emerald-600 font-medium">After: </span>
                              <span className="text-[var(--color-foreground-muted)]">
                                {JSON.stringify(log.newValues).slice(0, 50)}
                                {JSON.stringify(log.newValues).length > 50 && '...'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatActionName(action: string): string {
  return action
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
