import axios from "axios";

const getDummyData = (config) => {
    const url = config.url || "";
    const method = config.method || "get";

    if (url.includes("/login")) {
        return { token: "mock-token-123", user: { id: 1, email: "admin@example.com" } };
    }
    if (url.includes("/elections")) {
        if (method === 'get') return [{ id: 1, name: "Sample Election", status: "DRAFT" }];
        if (method === 'post') return { id: Date.now(), status: "DRAFT", ...(config.data ? JSON.parse(config.data) : {}) };
    }
    if (url.includes("/users")) {
        return []; // VoterApproval will use its internal mock data if we return an empty array, or we can just return array to prevent crash.
    }
    if (url.includes("/ballots")) {
        if (method === 'get') return [];
    }
    return { success: true, message: "Mocked response" };
};

const api = axios.create({
    baseURL: "/api",
});

// Automatically attach token and mock network requests
api.interceptors.request.use((config) => {
    const stored = localStorage.getItem("auth");

    if (stored) {
        const { token } = JSON.parse(stored);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    // Mock Adapter: Return a resolved promise with dummy data
    config.adapter = async (config) => {
        console.log("Mocking request:", config.method.toUpperCase(), config.url);
        const data = getDummyData(config);
        return {
            data: data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: config,
            request: {}
        };
    };

    return config;
});

export default api;
