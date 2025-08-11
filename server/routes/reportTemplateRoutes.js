// server/routes/reportTemplateRoutes.js
import express from 'express';
import { listTemplates, getTemplate, saveTemplate, deleteTemplate } from '../controllers/reportTemplateController.js';
import  authorizeRoles  from '../middleware/authorizeRoles.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken, authorizeRoles('admin', 'super-admin'));

router.get('/', listTemplates);
router.get('/:key', getTemplate);
router.post('/', saveTemplate);
router.put('/:key', saveTemplate);
router.delete('/:key', deleteTemplate);

export default router;