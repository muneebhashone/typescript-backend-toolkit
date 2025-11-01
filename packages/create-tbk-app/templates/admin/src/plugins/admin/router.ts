import path from 'path';
import { type Application, Router, type RequestHandler } from 'express';
import formidable from 'formidable';
import type { FilterQuery } from 'mongoose';
import { adminResources, getResource } from './registry';
import { buildSearchQuery, getFields } from './utils/schema-introspection';
import type { AdminField } from './types';
import { storageProvider } from '@/lib/storage';
import type { FormFile } from '@/types';
import logger from '@/plugins/observability/logger';

export const adminApiRouter = Router();

const adminStorageProvider = storageProvider;

/**
 * Middleware to handle file uploads for admin resources
 * Uses the configured storage provider (S3, R2, or local)
 */
async function uploadForResource(req: any, res: any, next: any) {
  const resource = getResource(req.params.resource);
  if (!resource || !resource.fileFields || resource.fileFields.length === 0)
    return next();
  const ct = String(req.headers['content-type'] || '');
  if (!ct.startsWith('multipart/form-data')) return next();

  const form = formidable({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filename: (_name, _ext, part) => {
      const safe = (part.originalFilename || 'file').replace(
        /[^a-zA-Z0-9._-]+/g,
        '-',
      );
      return `${Date.now()}-${safe}`;
    },
  });

  form.parse(
    req,
    async (
      err: Error | null,
      fields: formidable.Fields,
      files: formidable.Files,
    ) => {
      if (err) {
        return res.status(400).json({
          error: 'Failed to parse multipart data',
          details: err.message,
        });
      }

      try {
        // Normalize fields
        const normalizedFields: Record<string, any> = {};
        for (const [key, value] of Object.entries(fields)) {
          normalizedFields[key] =
            Array.isArray(value) && value.length === 1 ? value[0] : value;
        }

        // Upload files to storage provider and get URLs
        const uploadedFiles: Record<string, any> = {};
        for (const [key, value] of Object.entries(files)) {
          if (!resource.fileFields?.includes(key)) continue;

          const fileArray = Array.isArray(value) ? value : [value];
          const uploadResults = [];

          for (const file of fileArray) {
            if (!file) continue;

            // Convert formidable.File to FormFile format
            const formFile: FormFile = {
              filepath: file.filepath,
              originalFilename: file.originalFilename || 'file',
              mimetype: file.mimetype || 'application/octet-stream',
              size: file.size,
            };

            // Generate unique key for storage
            const originalName = formFile.originalFilename || 'file';
            const ext = path.extname(originalName);
            const basename = path.basename(originalName, ext);
            const safeBasename = basename.replace(/[^a-zA-Z0-9._-]+/g, '-');
            const storageKey = `admin/${resource.name}/${Date.now()}-${safeBasename}${ext}`;

            // Upload to storage provider
            const result = await adminStorageProvider.upload({
              file: formFile,
              key: storageKey,
            });

            uploadResults.push({
              url: result.url,
              key: result.key,
              filename: formFile.originalFilename,
              size: formFile.size,
              mimetype: formFile.mimetype,
            });
          }

          // Store results
          if (Array.isArray(value)) {
            uploadedFiles[key] = uploadResults;
          } else {
            uploadedFiles[key] = uploadResults[0];
          }
        }

        // Merge into req.body
        req.body = { ...normalizedFields };
        req.uploadedFiles = uploadedFiles;

        next();
      } catch (uploadErr: any) {
        logger.error(
          { err: uploadErr, resource: resource.name },
          'Failed to upload files',
        );
        return res.status(500).json({
          error: 'Failed to upload files',
          details: uploadErr.message,
        });
      }
    },
  );
}

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
  res.json({
    name: resource.name,
    label: resource.label ?? resource.name,
    fields,
    fileFields: resource.fileFields || [],
  });
});

adminApiRouter.get('/:resource', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });

  const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit || '10'), 10) || 10, 1),
    100,
  );
  const sort = String(req.query.sort || '-createdAt');
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;

  const allowedFields =
    resource.fields && resource.fields.length ? resource.fields : undefined;
  const fieldsMeta = getFields(resource.model, allowedFields);
  const searchQuery = buildSearchQuery(q, fieldsMeta);
  const query: FilterQuery<any> = { ...(searchQuery as object) };

  const projection = allowedFields
    ? Object.fromEntries([...allowedFields, '_id'].map((f) => [f, 1]))
    : undefined;

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

// Relation lookup endpoint: search or batch by ids to retrieve label options
adminApiRouter.get('/:resource/lookup/:field', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });

  const fieldsMeta = getFields(resource.model, resource.fields);
  const field = findFieldByPath(fieldsMeta, req.params.field);
  if (!field || field.type !== 'relation' || !field.relation)
    return res.status(404).json({ error: 'relation_field_not_found' });

  // Resolve target resource/model and display field
  const target = adminResources.find(
    (r) => r.name === field.relation!.resource,
  );
  if (!target)
    return res.status(404).json({ error: 'target_resource_not_found' });
  const labelField =
    field.relation!.displayField || target.displayField || 'name';

  const idsParam =
    typeof req.query.ids === 'string' ? req.query.ids : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit || '10'), 10) || 10, 1),
    100,
  );
  const recent = req.query.recent === '1' || req.query.recent === 'true';

  try {
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length === 0) return res.json({ options: [] });
      const docs = await target.model
        .find({ _id: { $in: ids } }, { _id: 1, [labelField]: 1 })
        .limit(100)
        .lean();
      const label = (d: any) =>
        d && (d[labelField] ?? d.name ?? d.title ?? d.email ?? String(d._id));
      const options = docs.map((d: any) => ({
        _id: String(d._id),
        label: String(label(d)),
      }));
      return res.json({ options });
    }

    if (q) {
      const query: any = { [labelField]: { $regex: q, $options: 'i' } };
      const docs = await target.model
        .find(query, { _id: 1, [labelField]: 1 })
        .sort({ [labelField]: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      const label = (d: any) =>
        d && (d[labelField] ?? d.name ?? d.title ?? d.email ?? String(d._id));
      const options = docs.map((d: any) => ({
        _id: String(d._id),
        label: String(label(d)),
      }));
      return res.json({ options, page, limit });
    }

    // Recent items mode (no q or ids). Prefer newest first based on timestamps if available.
    if (recent || (!idsParam && !q)) {
      const sortBy: any = target.model.schema?.paths?.createdAt
        ? { createdAt: -1 }
        : { _id: -1 };
      const docs = await target.model
        .find({}, { _id: 1, [labelField]: 1 })
        .sort(sortBy)
        .limit(limit)
        .lean();
      const label = (d: any) =>
        d && (d[labelField] ?? d.name ?? d.title ?? d.email ?? String(d._id));
      const options = docs.map((d: any) => ({
        _id: String(d._id),
        label: String(label(d)),
      }));
      return res.json({ options, page: 1, limit });
    }

    return res
      .status(400)
      .json({ error: 'missing_query', details: 'Provide ids, q, or recent=1' });
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: 'lookup_failed', details: err?.message });
  }
});

adminApiRouter.get('/:resource/:id', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });
  const allowedFields =
    resource.fields && resource.fields.length ? resource.fields : undefined;
  const projection = allowedFields
    ? Object.fromEntries([...allowedFields, '_id'].map((f) => [f, 1]))
    : undefined;
  const doc = await resource.model.findById(req.params.id, projection).lean();
  if (!doc) return res.status(404).json({ error: 'not_found' });
  res.json({ data: doc });
});

adminApiRouter.post('/:resource', uploadForResource, async (req: any, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });
  try {
    const body = { ...(req.body || {}) } as Record<string, unknown>;

    // Handle uploaded files - store the URL from storage provider
    if (resource.fileFields && req.uploadedFiles) {
      for (const field of resource.fileFields) {
        const uploadedFile = req.uploadedFiles[field];
        if (uploadedFile) {
          // Store the URL (and optionally the key for deletion)
          if (Array.isArray(uploadedFile)) {
            body[field] = uploadedFile[0]?.url;
            // Store key for future deletion
            body[`${field}_key`] = uploadedFile[0]?.key;
          } else {
            body[field] = uploadedFile.url;
            // Store key for future deletion
            body[`${field}_key`] = uploadedFile.key;
          }
        }
      }
    }

    const created = await resource.model.create(body);
    res.status(201).json({ data: created });
  } catch (err: any) {
    res.status(400).json({ error: 'validation_error', details: err?.message });
  }
});

adminApiRouter.put(
  '/:resource/:id',
  uploadForResource,
  async (req: any, res) => {
    const resource = getResource(req.params.resource);
    if (!resource) return res.status(404).json({ error: 'resource_not_found' });
    const readOnly = new Set([...(resource.readOnlyFields || []), '_id']);
    const payload: Record<string, unknown> = {};

    // Copy non-readonly fields
    for (const [k, v] of Object.entries(req.body || {})) {
      if (!readOnly.has(k)) payload[k] = v;
    }

    // Handle uploaded files
    if (resource.fileFields && req.uploadedFiles) {
      // First, get the existing document to delete old files
      const existing = (await resource.model
        .findById(req.params.id)
        .lean()) as any;

      for (const field of resource.fileFields) {
        if (readOnly.has(field)) continue;

        const uploadedFile = req.uploadedFiles[field];
        if (uploadedFile) {
          // Delete old file if it exists
          const oldKey = existing?.[`${field}_key`];
          if (oldKey) {
            try {
              await adminStorageProvider.delete(oldKey);
              logger.info(
                { key: oldKey, field, resource: resource.name },
                'Deleted old file during update',
              );
            } catch (deleteErr: any) {
              logger.error(
                { err: deleteErr, key: oldKey },
                'Failed to delete old file',
              );
            }
          }

          // Store new file URL and key
          if (Array.isArray(uploadedFile)) {
            payload[field] = uploadedFile[0]?.url;
            payload[`${field}_key`] = uploadedFile[0]?.key;
          } else {
            payload[field] = uploadedFile.url;
            payload[`${field}_key`] = uploadedFile.key;
          }
        }
      }
    }

    try {
      const updated = await resource.model.findByIdAndUpdate(
        req.params.id,
        payload,
        {
          new: true,
          runValidators: true,
        },
      );
      if (!updated) return res.status(404).json({ error: 'not_found' });
      res.json({ data: updated });
    } catch (err: any) {
      res
        .status(400)
        .json({ error: 'validation_error', details: err?.message });
    }
  },
);

adminApiRouter.delete('/:resource/:id', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });

  // Get document before deletion to access file keys
  const doc = (await resource.model.findById(req.params.id).lean()) as any;
  if (!doc) return res.status(404).json({ error: 'not_found' });

  // Delete the document
  const deleted = await resource.model.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'not_found' });

  // Delete associated files from storage
  if (resource.fileFields && resource.fileFields.length > 0) {
    for (const field of resource.fileFields) {
      const fileKey = doc[`${field}_key`];
      if (fileKey) {
        try {
          await adminStorageProvider.delete(fileKey);
          logger.info(
            { key: fileKey, field, resource: resource.name, id: req.params.id },
            'Deleted file after resource deletion',
          );
        } catch (deleteErr: any) {
          logger.error(
            { err: deleteErr, key: fileKey, field },
            'Failed to delete file from storage',
          );
        }
      }
    }
  }

  res.json({ ok: true });
});

// Bulk delete by ids
adminApiRouter.post('/:resource/bulk-delete', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });

  const ids = Array.isArray(req.body?.ids)
    ? (req.body.ids as unknown[]).map(String).filter(Boolean)
    : [];
  if (ids.length === 0)
    return res
      .status(400)
      .json({ error: 'invalid_request', details: 'ids[] required' });

  try {
    // Get documents before deletion to access file keys
    const docs =
      resource.fileFields && resource.fileFields.length > 0
        ? ((await resource.model.find({ _id: { $in: ids } }).lean()) as any[])
        : [];

    // Delete documents from database
    const result = await resource.model.deleteMany({ _id: { $in: ids } });

    // Delete associated files from storage
    if (docs.length > 0 && resource.fileFields) {
      for (const doc of docs) {
        for (const field of resource.fileFields) {
          const fileKey = doc[`${field}_key`];
          if (fileKey) {
            try {
              await adminStorageProvider.delete(fileKey);
              logger.info(
                { key: fileKey, field, resource: resource.name, id: doc._id },
                'Deleted file during bulk delete',
              );
            } catch (deleteErr: any) {
              logger.error(
                { err: deleteErr, key: fileKey, field },
                'Failed to delete file from storage',
              );
            }
          }
        }
      }
    }

    return res.json({ deletedCount: result?.deletedCount ?? 0 });
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: 'bulk_delete_failed', details: err?.message });
  }
});

// Clear all documents for a resource
adminApiRouter.post('/:resource/clear', async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ error: 'resource_not_found' });
  try {
    // Get all documents before deletion to access file keys
    const docs =
      resource.fileFields && resource.fileFields.length > 0
        ? ((await resource.model.find({}).lean()) as any[])
        : [];

    // Delete all documents from database
    const result = await resource.model.deleteMany({});

    // Delete associated files from storage
    if (docs.length > 0 && resource.fileFields) {
      for (const doc of docs) {
        for (const field of resource.fileFields) {
          const fileKey = doc[`${field}_key`];
          if (fileKey) {
            try {
              await adminStorageProvider.delete(fileKey);
              logger.info(
                { key: fileKey, field, resource: resource.name, id: doc._id },
                'Deleted file during clear',
              );
            } catch (deleteErr: any) {
              logger.error(
                { err: deleteErr, key: fileKey, field },
                'Failed to delete file from storage',
              );
            }
          }
        }
      }
    }

    return res.json({ deletedCount: result?.deletedCount ?? 0 });
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: 'clear_failed', details: err?.message });
  }
});

export function registerAdminUI(
  app: Application,
  adminPath: string = '/admin',
  guard?: RequestHandler,
) {
  const handlers: RequestHandler[] = [];
  if (guard) handlers.push(guard);
  handlers.push((_req, res) => {
    const indexPath = path.join(process.cwd(), 'public', 'admin', 'index.html');
    res.sendFile(indexPath);
  });

  app.get(adminPath, ...handlers);
}

function findFieldByPath(
  fields: AdminField[],
  dotted: string,
): AdminField | undefined {
  const parts = dotted.split('.');
  let currentFields = fields;
  let field: AdminField | undefined;
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    field = currentFields.find((f) => f.path === seg);
    if (!field) return undefined;
    if (i < parts.length - 1) {
      if (field.type !== 'subdocument' || !field.children) return undefined;
      currentFields = field.children;
    }
  }
  return field;
}
