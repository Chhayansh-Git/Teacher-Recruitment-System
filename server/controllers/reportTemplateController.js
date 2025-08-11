// server/controllers/reportTemplateController.js
import fs from 'fs/promises';
import path from 'path';
import createError from 'http-errors';
import asyncHandler from '../middleware/asyncHandler.js';

const TEMPLATE_DIR = path.join(process.cwd(), 'templates', 'reports');

export const listTemplates = asyncHandler(async (_req, res) => {
  const files = await fs.readdir(TEMPLATE_DIR);
  res.json({ data: files });
});

export const getTemplate = asyncHandler(async (req, res) => {
  const file = path.join(TEMPLATE_DIR, req.params.key);
  if (!file.startsWith(TEMPLATE_DIR)) throw createError(403, 'Invalid path');
  const content = await fs.readFile(file, 'utf8');
  res.json({ data: { name: req.params.key, content } });
});

export const saveTemplate = asyncHandler(async (req, res) => {
  const { key, content } = req.body;
  if (!/^[a-zA-Z0-9_-]+\.hbs$/.test(key)) throw createError(400, 'Invalid filename');
  await fs.writeFile(path.join(TEMPLATE_DIR, key), content, 'utf8');
  res.json({ message: 'Template saved' });
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const file = path.join(TEMPLATE_DIR, req.params.key);
  if (!file.startsWith(TEMPLATE_DIR)) throw createError(403, 'Invalid path');
  await fs.unlink(file);
  res.json({ message: 'Template deleted' });
});