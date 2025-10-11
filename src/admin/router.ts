import path from 'path';
import { type Application, Router } from 'express';
import type { FilterQuery } from 'mongoose';
import { adminResources, getResource } from './registry';
import { buildSearchQuery, getFields } from './utils/schema-introspection';

export const adminApiRouter = Router();

adminApiRouter.get('/meta', (_req, res) => {
  const resources = adminResources.map((r) => ({
    name: r.name,
    label: r.label ?? r.name,
  }));
  res.json({ resources });
});

adminApiRouter.get('/:resource/meta', (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });
  const fields = getFields(resource.model, resource.fields);
  res.json({ name: resource.name, label: resource.label ?? resource.name, fields });
});

adminApiRouter.get('/:resource', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });

  const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || '10'), 10) || 10, 1), 100);
  const sort = String(req.query.sort || '-createdAt');
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;

  const allowedFields = resource.fields && resource.fields.length ? resource.fields : undefined;
  const fieldsMeta = getFields(resource.model, allowedFields);
  const searchQuery = buildSearchQuery(q, fieldsMeta);
  const query: FilterQuery<any> = { ...(searchQuery as object) };

  const projection = allowedFields ? Object.fromEntries([...allowedFields, '_id'].map((f) => [f, 1])) : undefined;

  const [data, total] = await Promise.all([
    resource.model
      .find(query, projection)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    resource.model.countDocuments(query),
  ]);

  res.json({ data, page, limit, total });
});

adminApiRouter.get('/:resource/:id', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });
  const allowedFields = resource.fields && resource.fields.length ? resource.fields : undefined;
  const projection = allowedFields ? Object.fromEntries([...allowedFields, '_id'].map((f) => [f, 1])) : undefined;
  const doc = await resource.model.findById(req.params.id, projection).lean();
  if (!doc) return res.status(404).json({ error: 'not_found' });
  res.json({ data: doc });
});

adminApiRouter.post('/:resource', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });
  try {
    const created = await resource.model.create(req.body);
    res.status(201).json({ data: created });
  } catch (err: any) {
    res.status(400).json({ error: 'validation_error', details: err?.message });
  }
});

adminApiRouter.put('/:resource/:id', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });
  const readOnly = new Set([...(resource.readOnlyFields || []), '_id']);
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(req.body || {})) {
    if (!readOnly.has(k)) payload[k] = v;
  }
  try {
    const updated = await resource.model.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'not_found' });
    res.json({ data: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'validation_error', details: err?.message });
  }
});

adminApiRouter.delete('/:resource/:id', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });
  const deleted = await resource.model.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

export function registerAdminUI(app: Application) {
  app.get('/admin', (_req, res) => {
    const indexPath = path.join(__dirname, '..', '..', 'public', 'admin', 'index.html');
    res.sendFile(indexPath);
  });
}
