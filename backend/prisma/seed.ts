// Cargar variables de entorno
import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed');

  // Limpiar datos previos (orden inverso a relaciones)
  await prisma.inventoryItem.deleteMany();
  await prisma.section.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  // Crear Permisos
  const permissions = [
    { resource: 'inventory', action: 'create' },
    { resource: 'inventory', action: 'read' },
    { resource: 'inventory', action: 'update' },
    { resource: 'inventory', action: 'delete' },
    { resource: 'sections', action: 'create' },
    { resource: 'sections', action: 'read' },
    { resource: 'sections', action: 'update' },
    { resource: 'sections', action: 'delete' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'manage' },
  ];

  await prisma.permission.createMany({ 
    data: permissions 
  });
  
  const allPerms = await prisma.permission.findMany();

  // Crear Roles con sus permisos
  const adminRole = await prisma.role.create({
    data: { 
      name: 'Admin', 
      permissions: { 
        connect: allPerms.map(p => ({ id: p.id })) 
      } 
    },
  });
  
  const managerPerms = allPerms.filter(p => p.resource !== 'users');
  const managerRole = await prisma.role.create({
    data: { 
      name: 'Manager', 
      permissions: { 
        connect: managerPerms.map(p => ({ id: p.id })) 
      } 
    },
  });
  
  const viewerPerms = allPerms.filter(p => p.action === 'read');
  const viewerRole = await prisma.role.create({
    data: { 
      name: 'Viewer', 
      permissions: { 
        connect: viewerPerms.map(p => ({ id: p.id })) 
      } 
    },
  });

  // Crear Usuario Admin
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  await prisma.user.create({
    data: {
      name: 'Administrador General',
      email: 'admin@plataforma.com',
      passwordHash,
      roleId: adminRole.id,
    },
  });

  // Crear Secciones de ejemplo
  await prisma.section.createMany({
    data: [
      { name: 'Bebidas', description: 'Inventario para restaurantes/bares' },
      { name: 'Medicamentos', description: 'Control farmacéutico hospitalario' },
      { name: 'Electrónicos', description: 'Componentes y dispositivos TI' },
    ],
  });

  console.log('Seed completado exitosamente');
  console.log('Roles creados: Admin, Manager, Viewer');
  console.log('Usuario admin: admin@plataforma.com / Admin123!');
  console.log('Secciones: Bebidas, Medicamentos, Electrónicos');
}

main()
    .catch((e) => { 
        console.error('Error en seed:', e);
        process.exit(1); 
    })
    .finally(async () => {
        await prisma.$disconnect();
    });