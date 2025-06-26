import { rest } from 'msw';
import type { components } from '../generated/types';

type {{APPLET_PASCAL_CASE}} = components['schemas']['{{APPLET_PASCAL_CASE}}'];

// Mock data
const mock{{APPLET_PASCAL_CASE}}s: {{APPLET_PASCAL_CASE}}[] = [
  {
    id: 1,
    name: 'Sample {{APPLET_PASCAL_CASE}} 1',
    description: 'This is a sample {{APPLET_NAME}} item',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 2,
    name: 'Sample {{APPLET_PASCAL_CASE}} 2',
    description: 'This is another sample {{APPLET_NAME}} item',
    status: 'inactive',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
  },
];

export const {{APPLET_CAMEL_CASE}}Handlers = [
  // List {{APPLET_NAME}} items
  rest.get('/api/{{APPLET_NAME}}', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;
    const search = req.url.searchParams.get('search');
    const status = req.url.searchParams.get('status');

    let filtered = mock{{APPLET_PASCAL_CASE}}s;

    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filtered = filtered.filter(item => item.status === status);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return res(
      ctx.json({
        items,
        total: filtered.length,
        page,
        pageSize,
      })
    );
  }),

  // Get single {{APPLET_NAME}} item
  rest.get('/api/{{APPLET_NAME}}/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const item = mock{{APPLET_PASCAL_CASE}}s.find(i => i.id === id);

    if (!item) {
      return res(
        ctx.status(404),
        ctx.json({
          code: 'NOT_FOUND',
          message: '{{APPLET_PASCAL_CASE}} not found',
        })
      );
    }

    return res(ctx.json(item));
  }),

  // Create {{APPLET_NAME}} item
  rest.post('/api/{{APPLET_NAME}}', async (req, res, ctx) => {
    const body = await req.json();
    const newItem: {{APPLET_PASCAL_CASE}} = {
      id: Math.max(...mock{{APPLET_PASCAL_CASE}}s.map(i => i.id)) + 1,
      ...body,
      status: body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mock{{APPLET_PASCAL_CASE}}s.push(newItem);
    return res(ctx.json(newItem));
  }),

  // Update {{APPLET_NAME}} item
  rest.put('/api/{{APPLET_NAME}}/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const itemIndex = mock{{APPLET_PASCAL_CASE}}s.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          code: 'NOT_FOUND',
          message: '{{APPLET_PASCAL_CASE}} not found',
        })
      );
    }

    mock{{APPLET_PASCAL_CASE}}s[itemIndex] = {
      ...mock{{APPLET_PASCAL_CASE}}s[itemIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return res(ctx.json(mock{{APPLET_PASCAL_CASE}}s[itemIndex]));
  }),

  // Delete {{APPLET_NAME}} item
  rest.delete('/api/{{APPLET_NAME}}/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const itemIndex = mock{{APPLET_PASCAL_CASE}}s.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          code: 'NOT_FOUND',
          message: '{{APPLET_PASCAL_CASE}} not found',
        })
      );
    }

    mock{{APPLET_PASCAL_CASE}}s.splice(itemIndex, 1);
    return res(ctx.status(204));
  }),
];