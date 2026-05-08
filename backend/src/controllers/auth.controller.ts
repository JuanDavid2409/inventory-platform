import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyPassword, generateTokens } from "../utils/auth";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({ 
            where: { email }, 
            include: { role: true }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ 
                success: false, 
                error: { 
                    code: 'INVALID_CREDENTIALS', 
                    message: 'User not found or inactive'
                }
            });
        }

        const validPass = await verifyPassword(password, user.passwordHash);
        if (!validPass) {
            return res.status(401).json({ 
                success: false, 
                error: { 
                    code: 'INVALID_CREDENTIALS', 
                    message: 'Incorrect password' 
                } 
            });
        }

        const tokens = generateTokens(user.id, user.role.name);
        
        res.json({ 
            success: true, 
            data: { 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    role: user.role.name 
                }, 
                tokens 
            } 
        });
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ 
                success: false, 
                error: { 
                    code: 'VALIDATION_ERROR', 
                    message: error 
                } 
            });
        }
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: { 
                code: 'SERVER_ERROR', 
                message: 'Login failed' 
            } 
        });
    }
};