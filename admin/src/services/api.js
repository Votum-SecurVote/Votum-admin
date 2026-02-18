import axios from "axios";

const api = axios.create({
    baseURL: "/api",
});

// Automatically attach token
api.interceptors.request.use((config) => {
    const stored = localStorage.getItem("auth");

    if (stored) {
        const { token } = JSON.parse(stored);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

export default api;
