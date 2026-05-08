import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { z } from 'zod';

// ✅ Helper para Zod errors (SOLUCIONA el problema de TypeScript)
const zodErrorResponse = (error: z.ZodError) => ({
  success: false,
  error: {
    code: 'VALIDATION_ERROR' as const,
    message: 'Validation failed',
    details: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  },
});

const createInventorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  value: z.number().positive(),
  sectionId: z.string(),
});

const updateInventorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  value: z.number().positive().optional(),
  sectionId: z.string().optional(),
});

export const InventoryController = {
  async findAll(req: Request, res: Response) {
    try {
      const result = await InventoryService.findAll(req.query);
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch inventory' } });
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const item = await InventoryService.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inventory item not found' } });
      }
      res.json({ success: true, item });
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch inventory item' } });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const validated = createInventorySchema.parse(req.body);
      const item = await InventoryService.create(validated);
      res.status(201).json({ success: true, item });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(zodErrorResponse(error)); // ✅ FIXED
      }
      console.error('Error creating inventory item:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create inventory item' } });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validated = updateInventorySchema.parse(req.body);
      const item = await InventoryService.update(id, validated);
      res.json({ success: true, item });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(zodErrorResponse(error)); // ✅ FIXED
      }
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inventory item not found' } });
      }
      console.error('Error updating inventory item:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update inventory item' } });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await InventoryService.delete(id);
      res.json({ success: true, message: 'Inventory item deleted successfully' });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inventory item not found' } });
      }
      console.error('Error deleting inventory item:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete inventory item' } });
    }
  },
};