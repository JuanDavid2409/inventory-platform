import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { z } from 'zod';

// Esquemas de validación con Zod
const createInventorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  value: z.number().positive(),
  sectionId: z.string().uuid(),
});

const updateInventorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  value: z.number().positive().optional(),
  sectionId: z.string().uuid().optional(),
});

export const InventoryController = {
  // GET /inventory
  async findAll(req: Request, res: Response) {
    try {
      const result = await InventoryService.findAll(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to fetch inventory' } 
      });
    }
  },

  // GET /inventory/:id
  async findById(req: Request, res: Response) {
    try {
      const item = await InventoryService.findById(req.params.id as string);
      if (!item) {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Item not found' } 
        });
      }
      res.json({ success: true, data: { item } });
    } catch (error) {
      console.error('Error fetching item:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to fetch item' } 
      });
    }
  },

  // POST /inventory
  async create(req: Request, res: Response) {
    try {
      const validated = createInventorySchema.parse(req.body);
      const item = await InventoryService.create(validated);
      res.status(201).json({ success: true, data: { item } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'VALIDATION_ERROR', message: error } 
        });
      }
      if ((error as Error).message === 'Section not found or inactive') {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'SECTION_NOT_FOUND', message: 'Section not found or inactive' } 
        });
      }
      console.error('Error creating item:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to create item' } 
      });
    }
  },

  // PATCH /inventory/:id
  async update(req: Request, res: Response) {
    try {
      const validated = updateInventorySchema.parse(req.body);
      const id = req.params.id as string;
      const item = await InventoryService.update(id, validated);
      res.json({ success: true, data: { item } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'VALIDATION_ERROR', message: error } 
        });
      }
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Item not found' } 
        });
      }
      console.error('Error updating item:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to update item' } 
      });
    }
  },

  // DELETE /inventory/:id
  async delete(req: Request, res: Response) {
    try {
      await InventoryService.delete(req.params.id as string);
      res.json({ success: true, data: { message: 'Item deleted successfully' } });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Item not found' } 
        });
      }
      console.error('Error deleting item:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to delete item' } 
      });
    }
  },
};