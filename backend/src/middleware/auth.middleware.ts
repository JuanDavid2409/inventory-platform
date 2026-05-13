import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: {code: 'UNAUTHORIZED', message: 'Token missing'}});
    }

    try {
        const decoded = verifyAccessToken(authHeader.split(' ')[1]);
        (req as any).user = decoded as { sub: string; role: string };
        next();
    } catch {
        return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token expired or invalid'} });
    }
};