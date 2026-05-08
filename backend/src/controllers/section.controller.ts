import { Request, Response } from 'express';
import { SectionService } from '../services/section.service';
import { z } from 'zod';

// Esquemas de validación con Zod
const createSectionSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

const updateSectionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const SectionController = {
  // GET /sections
  async findAll(req: Request, res: Response) {
    try {
      const result = await SectionService.findAll(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching sections:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to fetch sections' } 
      });
    }
  },

  // GET /sections/:id
  async findById(req: Request, res: Response) {
    try {
      const section = await SectionService.findById(req.params.id as string);
      if (!section) {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Section not found' } 
        });
      }
      res.json({ success: true, data: { section } });
    } catch (error) {
      console.error('Error fetching section:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to fetch section' } 
      });
    }
  },

  // POST /sections
  async create(req: Request, res: Response) {
    try {
      const validated = createSectionSchema.parse(req.body);
      
      const exists = await SectionService.existsByName(validated.name);
      if (exists) {
        return res.status(409).json({ 
          success: false, 
          error: { code: 'CONFLICT', message: 'Section already exists' } 
        });
      }

      const section = await SectionService.create(validated);
      res.status(201).json({ success: true, data: { section } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'VALIDATION_ERROR', message: error } 
        });
      }
      console.error('Error creating section:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to create section' } 
      });
    }
  },

  // PATCH /sections/:id
  async update(req: Request, res: Response) {
    try {
      const validated = updateSectionSchema.parse(req.body);
      const id = req.params.id as string;
    
      if (validated.name) {
        const exists = await SectionService.existsByName(validated.name, id);
        if (exists) {
          return res.status(409).json({ 
            success: false, 
            error: { code: 'CONFLICT', message: 'Section already exists' } 
          });
        }
      }

      const section = await SectionService.update(id, validated);
      res.json({ success: true, data: { section } });
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
          error: { code: 'NOT_FOUND', message: 'Section not found' } 
        });
      }
      console.error('Error updating section:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to update section' } 
      });
    }
  },

  // DELETE /sections/:id
  async delete(req: Request, res: Response) {
    try {
      await SectionService.delete(req.params.id as string);
      res.json({ success: true, data: { message: 'Section deleted successfully' } });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Section not found' } 
        });
      }
      console.error('Error deleting section:', error);
      res.status(500).json({ 
        success: false, 
        error: { code: 'SERVER_ERROR', message: 'Failed to delete section' } 
      });
    }
  },
};