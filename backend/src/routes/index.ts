import { Router } from 'express';
import { SectionController } from '../controllers/section.controller';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();

// Sections
router.get('/sections', SectionController.findAll);
router.get('/sections/:id', SectionController.findById);
router.post('/sections', SectionController.create);
router.patch('/sections/:id', SectionController.update);
router.delete('/sections/:id', SectionController.delete);

// Inventory
router.get('/inventory', InventoryController.findAll);
router.get('/inventory/:id', InventoryController.findById);
router.post('/inventory', InventoryController.create);
router.patch('/inventory/:id', InventoryController.update);
router.delete('/inventory/:id', InventoryController.delete);

export default router;