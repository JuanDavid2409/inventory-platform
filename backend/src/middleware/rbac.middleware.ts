import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const requirePermission = (resource: string, action: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = await prisma.role.findUnique({
            where: { name: (req as any).user.role },
            include: { permissions: true },
        });

        const hasPermission = role?.permissions.some((p) => p.resource === resource && p.action === action);
            if (!hasPermission) {
            return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
        }
        next();
    } catch (error) {
        console.error('RBAC Error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Permission check failed' } });
    }
};