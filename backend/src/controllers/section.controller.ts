import { Request, Response } from 'express';
import { SectionService } from '../services/section.service';
import { z } from 'zod';

const createSectionSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

const updateSectionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

// ✅ Helper para Zod errors
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

export const SectionController = {
  async findAll(req: Request, res: Response) {
    try {
      const result = await SectionService.findAll(req.query);
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error fetching sections:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch sections' } });
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const section = await SectionService.findById(id);
      if (!section) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Section not found' } });
      }
      res.json({ success: true, section });
    } catch (error) {
      console.error('Error fetching section:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch section' } });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const validated = createSectionSchema.parse(req.body);
      const exists = await SectionService.existsByName(validated.name);
      if (exists) {
        return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Section already exists' } });
      }
      const section = await SectionService.create(validated);
      res.status(201).json({ success: true, section });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(zodErrorResponse(error)); // ✅ FIXED
      }
      console.error('Error creating section:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create section' } });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validated = updateSectionSchema.parse(req.body);
      
      if (validated.name) {
        const exists = await SectionService.existsByName(validated.name, id);
        if (exists) {
          return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Section already exists' } });
        }
      }

      const section = await SectionService.update(id, validated);
      res.json({ success: true, section });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(zodErrorResponse(error)); // ✅ FIXED
      }
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Section not found' } });
      }
      console.error('Error updating section:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update section' } });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await SectionService.delete(id);
      res.json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Section not found' } });
      }
      console.error('Error deleting section:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete section' } });
    }
  },
};