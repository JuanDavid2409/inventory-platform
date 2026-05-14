'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Package, TrendingUp } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  _count?: { items: number };
}

interface Stats {
  totalSections: number;
  totalItems: number;
  totalValue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalSections: 0, totalItems: 0, totalValue: 0 });
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [sectionsRes, inventoryRes] = await Promise.all([
        api.get('/sections'),
        api.get('/inventory'),
      ]);

      //const sectionsData = sectionsRes.data?.data?.data || sectionsRes.data?.data || [];
      const sectionsData = sectionsRes.data?.result?.data || sectionsRes.data?.data || [];
      const inventoryData = inventoryRes.data?.data?.data || inventoryRes.data?.data || [];

      const totalValue = inventoryData.reduce((sum: number, item: any) => 
        sum + parseFloat(item.value || 0), 0
      );

      setStats({
        totalSections: sectionsData.length,
        totalItems: inventoryData.length,
        totalValue,
      });
      setSections(sectionsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general del inventario</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Secciones</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalSections}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Items</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Boxes className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Valor Total</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Secciones Recientes</h2>
        </div>
        <div className="p-6">
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.slice(0, 6).map((section) => (
                <div
                  key={section.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"
                >
                  <h3 className="font-medium text-gray-800">{section.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {section._count?.items || 0} items
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay secciones registradas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Icono necesario
function Boxes({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
      />
    </svg>
  );
}