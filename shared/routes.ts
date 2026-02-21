import { z } from 'zod';
import { insertArtifactSchema, insertCommentSchema, artifacts, comments } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  artifacts: {
    list: {
      method: 'GET' as const,
      path: '/api/artifacts' as const,
      responses: {
        200: z.array(z.custom<typeof artifacts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/artifacts/:id' as const,
      responses: {
        200: z.custom<typeof artifacts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/artifacts' as const,
      input: insertArtifactSchema,
      responses: {
        201: z.custom<typeof artifacts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    support: {
      method: 'POST' as const,
      path: '/api/artifacts/:id/support' as const,
      input: z.object({
        action: z.enum(['vote', 'stake', 'interact']),
      }),
      responses: {
        200: z.custom<typeof artifacts.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    comments: {
      list: {
        method: 'GET' as const,
        path: '/api/artifacts/:id/comments' as const,
        responses: {
          200: z.array(z.custom<typeof comments.$inferSelect>()),
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/artifacts/:id/comments' as const,
        input: insertCommentSchema.omit({ artifactId: true }), // ID is in URL
        responses: {
          201: z.custom<typeof comments.$inferSelect>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      support: {
        method: 'POST' as const,
        path: '/api/comments/:id/support' as const,
        responses: {
          200: z.custom<typeof comments.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      }
    }
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalArtifacts: z.number(),
          averageFadeLevel: z.number(),
          totalInteractions: z.number(),
          artifactsAtRisk: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ArtifactInput = z.infer<typeof api.artifacts.create.input>;
export type ArtifactResponse = z.infer<typeof api.artifacts.create.responses[201]>;
export type ArtifactsListResponse = z.infer<typeof api.artifacts.list.responses[200]>;
export type CommentInput = z.infer<typeof api.artifacts.comments.create.input>;
export type CommentResponse = z.infer<typeof api.artifacts.comments.create.responses[201]>;
export type CommentsListResponse = z.infer<typeof api.artifacts.comments.list.responses[200]>;
export type DashboardStatsResponse = z.infer<typeof api.dashboard.stats.responses[200]>;
