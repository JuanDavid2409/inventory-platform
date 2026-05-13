import { api } from "./axios";

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export const authService = {
    async login(data: LoginData) {
        const response = await api.post('/auth/login', data);
        const { user, tokens } = response.data.data;
    
        if (!tokens || !tokens.accessToken) {
            throw new Error('Token no recibido del servidor');
        }

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        return { user, accessToken: tokens.accessToken };
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    getUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    }
};