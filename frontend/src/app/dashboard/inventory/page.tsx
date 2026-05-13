'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { authService } from '@/lib/auth-service';
import { Plus, Edit, Trash2, Search, Loader2, X, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

//Esquema de validación
const inventorySchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  value: z.coerce.number().positive('El valor debe ser mayor a 0'),
  sectionId: z.string().uuid('Selecciona una sección válida'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  value: string; // Prisma Decimal llega como string
  sectionId: string;
  section: { id: string; name: string };
  isActive: boolean;
}

interface SectionOption {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  //Configuración del formulario
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema) as any, // ✅ Fix para error de tipos
    defaultValues: { name: '', description: '', value: 0, sectionId: '' },
  });

  //Cargar datos al montar
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async (query = '') => {
    setLoading(true);
    try {
      const [itemsRes, sectionsRes] = await Promise.all([
        api.get('/inventory', { params: query ? { search: query } : {} }),
        api.get('/sections'),
      ]);

      const itemsData = itemsRes.data?.data?.data || itemsRes.data?.data || [];
      const sectionsData = sectionsRes.data?.data?.data || sectionsRes.data?.data || [];

      setItems(itemsData);
      setSections(sectionsData.map((s: any) => ({ id: s.id, name: s.name })));
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  //Búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(search);
  };

  //Abrir Modal (Crear o Editar)
  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setValue('name', item.name);
      setValue('description', item.description || '');
      setValue('value', parseFloat(item.value));
      setValue('sectionId', item.sectionId);
    } else {
      setEditingItem(null);
      reset();
    }
    setModalOpen(true);
  };

  //Enviar formulario
  const onSubmit = async (data: InventoryFormData) => {
    try {
      if (editingItem) {
        await api.patch(`/inventory/${editingItem.id}`, data);
      } else {
        await api.post('/inventory', data);
      }
      setModalOpen(false);
      loadData(search);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al guardar el item');
    }
  };

  //Eliminar item
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      loadData(search);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al eliminar');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
            <p className="text-gray-600 text-sm mt-1">Gestiona tus productos y valores</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Item
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.section?.name || 'Sin sección'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${parseFloat(item.value).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(item)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {search ? 'No se encontraron resultados' : 'No hay items registrados'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {modalOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingItem ? 'Editar Item' : 'Nuevo Item'}
            </h2>
            <button
              onClick={() => setModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Ej: Coca Cola 500ml"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Descripción del producto..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('value')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="0.00"
              />
              {errors.value && (
                <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>
              )}
            </div>

            {/* Sección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sección *
              </label>
              <select
                {...register('sectionId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-400">Selecciona una sección</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id} className="text-gray-900">
                    {sec.name}
                  </option>
                ))}
              </select>
              {errors.sectionId && (
                <p className="text-red-500 text-xs mt-1">{errors.sectionId.message}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? 'Guardar Cambios' : 'Crear Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
}