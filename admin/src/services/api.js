import axios from "axios";

const api = axios.create({
    // Requests to "/api/..." are proxied to http://localhost:8080 by vite.config.js
    baseURL: "/api",
});

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
    const stored = localStorage.getItem("auth");
    if (stored) {
        try {
            const { token } = JSON.parse(stored);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // ignore invalid stored auth
        }
    }
    return config;
});

// Global error handler — 401 means session expired, redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("auth");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
