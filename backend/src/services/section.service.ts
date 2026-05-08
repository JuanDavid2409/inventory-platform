import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { buildPagination, parsePagination, PaginationParams } from '../utils/pagination';

export const SectionService = {
  // Listar secciones con filtros y paginación
  async findAll(params: PaginationParams) {
    const { page, limit, search, ...filters } = parsePagination(params);
    
    const where: Prisma.SectionWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...filters,
    };

    const [sections, total] = await Promise.all([
      prisma.section.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { items: true } } },
      }),
      prisma.section.count({ where }),
    ]);

    return {
      data: sections,
      pagination: buildPagination(total, page, limit),
    };
  },

  // Buscar por ID
  async findById(id: string) {
    return prisma.section.findUnique({
      where: { id, isActive: true },
      include: { _count: { select: { items: true } } },
    });
  },

  // Crear sección
  async create(data: { name: string; description?: string }) {
    return prisma.section.create({ data });
  },

  // Actualizar sección
  async update(id: string, data: { name?: string; description?: string }) {
    return prisma.section.update({
      where: { id },
      data: { 
        ...data,
        updatedAt: new Date() 
      },
    });
  },

  // Eliminar
  async delete(id: string) {
    return prisma.section.update({
      where: { id },
      data: { 
        isActive: false, 
        updatedAt: new Date() 
      },
    });
  },

  async existsByName(name: string, excludeId?: string) {
    const where: Prisma.SectionWhereInput = { 
      name, 
      isActive: true,
      ...(excludeId && { NOT: { id: excludeId } })
    };
    const count = await prisma.section.count({ where });
    return count > 0;
  }
};