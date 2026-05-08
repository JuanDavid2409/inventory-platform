import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();

// Rutas públicas (lectura para cualquier rol autenticado)
router.get('/', authenticate, requirePermission('inventory', 'read'), InventoryController.findAll);
router.get('/:id', authenticate, requirePermission('inventory', 'read'), InventoryController.findById);

// Rutas protegidas (requieren permisos específicos)
router.post('/', authenticate, requirePermission('inventory', 'create'), InventoryController.create);
router.patch('/:id', authenticate, requirePermission('inventory', 'update'), InventoryController.update);
router.delete('/:id', authenticate, requirePermission('inventory', 'delete'), InventoryController.delete);

export default router;