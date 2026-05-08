import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export const hashPassword = (password: string) => bcrypt.hash(password,12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const generateTokens = (userId: string, role: string) => {
    const accessToken = jwt.sign({ sub: userId, role }, process.env.JWT_SECRET!,{ expiresIn: '15m'});
    const refreshToken = jwt.sign({ sub: userId}, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d'});
    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => jwt.verify(token, process.env.JWT_SECRET!);
export const verifyRefreshToken = (token: string) => jwt.verify(token, process.env.JWT_REFRESH_SECRET!);