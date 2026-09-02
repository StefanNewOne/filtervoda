/**
 * OpenAPI 3.1 document + Swagger UI at /api/docs (CLAUDE.md Category 10). Route prefix /api/v1.
 * TODO(api): generate paths/components fully from the Zod schemas via zod-to-openapi — FV-<N>.
 * This initial spec documents the core surface (health, public read, lead intake, auth).
 */
import { Router } from 'express';

export const openApiDoc = {
  openapi: '3.1.0',
  info: { title: 'filtervoda API', version: '1.0.0', description: 'Lead-generation API for filtervoda.mk (SPAR Company).' },
  servers: [{ url: '/api/v1' }],
  paths: {
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' }, '503': { description: 'Degraded' } } } },
    '/public/products': { get: { summary: 'List published products', parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: 'Product cards' } } } },
    '/public/products/{slug}': { get: { summary: 'Product detail', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Product' }, '404': { description: 'Not found' } } } },
    '/public/settings': { get: { summary: 'Public settings (active template, contacts, flags)', responses: { '200': { description: 'Settings' } } } },
    '/leads': {
      post: {
        summary: 'Submit a lead (public)',
        description: 'Origin allowlist + Turnstile + honeypot + rate limit. One transaction: Lead + Event + Outbox + Audit.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LeadSubmission' } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Turnstile/validation' }, '403': { description: 'Bad origin' }, '429': { description: 'Rate limited' } },
      },
    },
    '/auth/login': { post: { summary: 'Admin login', responses: { '200': { description: 'Session established' }, '401': { description: 'Bad credentials' }, '423': { description: 'Locked' } } } },
  },
  components: {
    schemas: {
      LeadSubmission: {
        type: 'object',
        required: ['type', 'name', 'phone', 'consent', 'context'],
        properties: {
          type: { type: 'string', enum: ['B2C', 'B2B', 'CONTACT', 'ADVISOR'] },
          name: { type: 'string' },
          phone: { type: 'string', description: 'MK mobile, normalized to E.164' },
          email: { type: 'string' },
          city: { type: 'string' },
          company: { type: 'string' },
          productId: { type: 'string' },
          message: { type: 'string' },
          consent: { type: 'boolean', enum: [true] },
          context: { type: 'object' },
        },
      },
    },
  },
} as const;

const SWAGGER_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>filtervoda API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>window.onload=()=>SwaggerUIBundle({url:'/api/docs.json',dom_id:'#ui'})</script>
</body></html>`;

export const docsRouter = Router();
docsRouter.get('/docs.json', (_req, res) => res.json(openApiDoc));
docsRouter.get('/docs', (_req, res) => res.type('html').send(SWAGGER_HTML));
