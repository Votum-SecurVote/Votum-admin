import axios from "axios";

const getDummyData = (config) => {
    const url = config.url || "";
    const method = config.method || "get";

    if (url.includes("/login")) {
        return { token: "mock-token-123", user: { id: 1, email: "admin@example.com" } };
    }
    if (url.includes("/users") || url.includes("/pending-users")) {
        return [
            { userId: "UID-99283712", fullName: "Rajesh Kumar Sharma", photoUrl: "https://randomuser.me/api/portraits/men/75.jpg", status: "PENDING", email: "rajesh.k@example.com", phone: "+91 98765 43210", dob: "1985-04-12", gender: "Male", address: "Block-C, Sector 45, Noida, UP", election: "ELEC-2026", submissionDate: "2026-02-15" },
            { userId: "UID-11293847", fullName: "Priya Desai", photoUrl: null, status: "PENDING", email: "priya.d@example.com", phone: "+91 87654 32109", dob: "1992-08-22", gender: "Female", address: "Flat 402, Palm Heights, Mumbai, MH", election: "ELEC-2026", submissionDate: "2026-02-28" },
            { userId: "UID-55421980", fullName: "Anil Verma", photoUrl: "https://randomuser.me/api/portraits/men/32.jpg", status: "PENDING", email: "anil.v@example.com", phone: "+91 76543 21098", dob: "1978-11-05", gender: "Male", address: "Villa 3, Rosewood, Pune, MH", election: "ELEC-TECH", submissionDate: "2026-03-01" },
        ];
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
