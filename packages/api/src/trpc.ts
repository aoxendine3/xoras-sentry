import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';

/**
 * XORAS // tRPC INITIALIZATION
 * Standardized context and middleware for institutional security.
 */

export async function createTRPCContext(opts: { req: Request }) {
  const userId = opts.req.headers.get('x-user-id');
  const role = opts.req.headers.get('x-user-role') as 'ADMIN' | 'USER' | null;

  return {
    user: userId ? { id: userId, role: role || 'USER' } : null,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware: Institutional Auth
 * Nuance: Enforces zero-trust boundaries for protected procedures.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Institutional Credentials Required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
