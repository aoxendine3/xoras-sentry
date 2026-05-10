import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

/**
 * XORAS // AUDIT LOGS SCHEMA
 * Nuance: High-fidelity tracking of security events and AST metrics.
 */

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityName: text('entity_name').notNull(),
  domain: text('domain').notNull(),
  status: text('status').notNull().default('PENDING'),
  metrics: jsonb('metrics').$type<{
    secretsFound: number;
    hallucinationsDetected: number;
    auditTimeMs: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
