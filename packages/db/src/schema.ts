import { pgTable, text, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';

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

/**
 * XORAS // LICENSES SCHEMA
 * Nuance: Institutional license management and entitlement tracking.
 */
export const licenses = pgTable('licenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  licenseKey: text('license_key').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  email: text('email').notNull(),
  tier: text('tier').notNull().default('STANDARD'), // STANDARD, INSTITUTIONAL, etc.
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
