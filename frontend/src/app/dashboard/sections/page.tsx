'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Plus, Edit, Trash2, Search, Loader2, X, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

//Esquema de validación
const sectionSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface Section {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count?: { items: number };
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  //Configuración del formulario
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema) as any,
    defaultValues: { name: '', description: '' },
  });

  //Cargar datos al montar
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get('/sections', {
        params: query ? { search: query } : {},
      });
      const sectionsData = response.data?.result?.data || response.data?.data || [];
      console.log('Secciones extraídas:', sectionsData);
      setSections(sectionsData);
    } catch (err) {
      console.error('Error cargando secciones:', err);
    } finally {
      setLoading(false);
    }
  };

  //Búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSections(search);
  };

  //Abrir Modal (Crear o Editar)
  const openModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setValue('name', section.name);
      setValue('description', section.description || '');
    } else {
      setEditingSection(null);
      reset();
    }
    setModalOpen(true);
  };

  //Enviar formulario
  const onSubmit = async (data: SectionFormData) => {
    console.log('Datos', data);
    try {
      if (editingSection) {
        await api.patch(`/sections/${editingSection.id}`, data);
        toast.success("Seccion actualizda correctamente");
      } else {
        const response = await api.post('/sections', data);
        toast.success("Seccion creada correctamente");
        console.log('Seccion creada', response.data);
      }
      setModalOpen(false);
      await loadSections(search);
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error('Ya existe una sección con ese nombre');
      } else {
        toast.error(err.response?.data?.error?.message || 'Error al guardar la sección');
      }
    }
  };

  //Eliminar sección
  const handleDelete = async (id: string) => {
    const section = sections.find(s => s.id === id);
    const itemCount = section?._count?.items || 0;
    
    if (itemCount > 0) {
      if (!confirm(`Esta sección tiene ${itemCount} items. ¿Estás seguro de eliminarla? Los items quedarán sin sección.`)) {
        return;
      }
    } else {
      if (!confirm('¿Estás seguro de eliminar esta sección?')) return;
    }

    try {
      await api.delete(`/sections/${id}`);
      toast.success("Seccion eliminada correctamente");
      loadSections(search);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error al eliminar');
    }
  };

  if (loading && sections.length === 0) {
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
            <h1 className="text-2xl font-bold text-gray-800">Secciones</h1>
            <p className="text-gray-600 text-sm mt-1">
              Organiza tu inventario por categorías
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Sección
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
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
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
              {sections.map((section) => (
                <tr key={section.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="font-medium text-gray-900">{section.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {section.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {section._count?.items || 0} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        section.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {section.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(section)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {sections.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      {search ? 'No se encontraron resultados' : 'No hay secciones registradas'}
                    </p>
                    {!search && (
                      <button
                        onClick={() => openModal()}
                        className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Crear tu primera sección →
                      </button>
                    )}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingSection ? 'Editar Sección' : 'Nueva Sección'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="Ej: Bebidas, Medicamentos, Electrónicos"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="Describe el propósito de esta sección..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

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
                  {editingSection ? 'Guardar Cambios' : 'Crear Sección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}