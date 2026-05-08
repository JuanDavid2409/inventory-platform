import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { buildPagination, parsePagination, PaginationParams } from '../utils/pagination';

// Interfaz específica para filtros de inventario
interface InventoryFilters extends PaginationParams {
  sectionId?: string;
  minValue?: number;
  maxValue?: number;
}

export const InventoryService = {
  // Listar items con filtros avanzados
  async findAll(params: InventoryFilters) {
    const parsed = parsePagination(params);
    const { page, limit, search, sectionId, minValue, maxValue, ...filters } = parsed;
    
    const where: Prisma.InventoryItemWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(sectionId && { sectionId }),
      // ✅ Corregido: verificar que no sea undefined
      ...(minValue !== undefined && minValue !== null && { value: { gte: minValue } }),
      ...(maxValue !== undefined && maxValue !== null && { value: { lte: maxValue } }),
      ...filters,
    };

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { section: { select: { id: true, name: true } } },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return {
      items,
      pagination: buildPagination(total, page, limit),
    };
  },

  // Buscar por ID
  async findById(id: string) {
    return prisma.inventoryItem.findUnique({
      where: { id, isActive: true },
      include: { section: true },
    });
  },

  // Crear item
  async create(data: { name: string; description?: string; value: number; sectionId: string }) {
    // Validar que la sección existe y está activa
    const section = await prisma.section.findUnique({
      where: { id: data.sectionId, isActive: true },
    });
    
    if (!section) throw new Error('Section not found or inactive');

    return prisma.inventoryItem.create({
      data: {
        name: data.name,
        description: data.description,
        value: new Prisma.Decimal(data.value),
        sectionId: data.sectionId,
      },
      include: { section: true },
    });
  },

  // Actualizar item
  async update(
    id: string,
    data: { name?: string; description?: string; value?: number; sectionId?: string }
  ) {
    const updateData: Prisma.InventoryItemUpdateInput = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.value !== undefined) updateData.value = new Prisma.Decimal(data.value);
    if (data.sectionId !== undefined) {
      updateData.section = { connect: { id: data.sectionId } };
    }

    return prisma.inventoryItem.update({
      where: { id },
      data: updateData,
      include: { section: true },
    });
  },

  // Eliminar lógica (soft delete)
  async delete(id: string) {
    return prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });
  },
};