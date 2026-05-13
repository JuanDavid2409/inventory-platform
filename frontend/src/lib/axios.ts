import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token por peticion
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        console.log('Token enviado:', token ? 'Sí' : 'No hay');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Mensajes de error 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        //const originalRequest = error.config;

        if (error.response?.status === 401) {
            console.warn('Sesión expirada o inválida (401)');

            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';   
            }
        }
        return Promise.reject(error);
    }
);