import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { SectionController } from '../controllers/section.controller';

const router = Router();

// Rutas públicas (cualquier usuario autenticado puede leer)
router.get('/', authenticate, requirePermission('sections', 'read'), SectionController.findAll);
router.get('/:id', authenticate, requirePermission('sections', 'read'), SectionController.findById);

// Rutas protegidas (requieren permisos específicos)
router.post('/', authenticate, requirePermission('sections', 'create'), SectionController.create);
router.patch('/:id', authenticate, requirePermission('sections', 'update'), SectionController.update);
router.delete('/:id', authenticate, requirePermission('sections', 'delete'), SectionController.delete);

export default router;