import { router } from './trpc';
import { auditRouter } from './routers/audit';

/**
 * XORAS // ROOT API ROUTER
 * Nuance: Merges sub-routers for a unified, type-safe API boundary.
 */

export const appRouter = router({
  audit: auditRouter,
});

// Export type definition for the frontend
export type AppRouter = typeof appRouter;
