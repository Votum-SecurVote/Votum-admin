import axios from "axios";

// --- IN-MEMORY DATA STORE FOR MOCKS ---
let electionsStore = [
    { id: 'elec-1', title: "Test Election 2026", description: "Test Election", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(), status: "DRAFT" }
];

let ballotsStore = [
    { id: 'bal-101', electionId: 'elec-1', title: "Presidential Ballot", description: "Main ballot", status: "DRAFT" }
];

let candidatesStore = [
    { id: "c1", ballotId: 'bal-101', name: "Sample Candidate", party: "Independent", symbol: null }
];

let usersStore = [
    { userId: "UID-99283712", fullName: "Rajesh Kumar Sharma", photoUrl: "https://randomuser.me/api/portraits/men/75.jpg", status: "PENDING", email: "rajesh.k@example.com", phone: "+91 98765 43210", dob: "1985-04-12", gender: "Male", address: "Block-C, Sector 45, Noida, UP", election: "ELEC-2026", submissionDate: "2026-02-15" },
    { userId: "UID-11293847", fullName: "Priya Desai", photoUrl: null, status: "PENDING", email: "priya.d@example.com", phone: "+91 87654 32109", dob: "1992-08-22", gender: "Female", address: "Flat 402, Palm Heights, Mumbai, MH", election: "ELEC-2026", submissionDate: "2026-02-28" },
    { userId: "UID-55421980", fullName: "Anil Verma", photoUrl: "https://randomuser.me/api/portraits/men/32.jpg", status: "PENDING", email: "anil.v@example.com", phone: "+91 76543 21098", dob: "1978-11-05", gender: "Male", address: "Villa 3, Rosewood, Pune, MH", election: "ELEC-TECH", submissionDate: "2026-03-01" },
];

let activityLog = [
    { id: 1, action: "System Initialized", time: new Date().toISOString(), user: "System" }
];

const getDummyData = (config) => {
    const url = config.url || "";
    const method = config.method || "get";
    const data = config.data ? JSON.parse(config.data) : null;

    if (url.includes("/login")) {
        return { token: "mock-token-123", user: { id: 1, email: "admin@example.com" } };
    }

    // --- ACTIVITY METRICS & LOGS (For Dashboard) ---
    if (url.includes("/admin/metrics")) {
        return {
            totalElections: electionsStore.length,
            activeElections: electionsStore.filter(e => e.status === "PUBLISHED").length,
            pendingCandidates: usersStore.filter(u => u.status === "PENDING").length,
            approvedCandidates: usersStore.filter(u => u.status === "APPROVED").length,
            recentActivity: [...activityLog].reverse().slice(0, 5) // Last 5 actions
        };
    }

    // --- USERS / VOTERS ---
    if (url.includes("users") || url.includes("pending-users")) {
        if (method === 'get') return usersStore;
    }
    if (url.includes("/approve/")) {
        const id = url.split("/").pop();
        const user = usersStore.find(u => u.userId === id);
        if (user) user.status = "APPROVED";
        activityLog.push({ id: Date.now(), action: `Approved candidate ${id}`, time: new Date().toISOString(), user: "Admin" });
        return { success: true };
    }
    if (url.includes("/reject/")) {
        const id = url.split("/").pop();
        const user = usersStore.find(u => u.userId === id);
        if (user) user.status = "REJECTED";
        activityLog.push({ id: Date.now(), action: `Rejected candidate ${id}`, time: new Date().toISOString(), user: "Admin" });
        return { success: true };
    }

    // --- ELECTIONS ---
    if (url.includes("/elections")) {
        // Handle /elections/{id}/ballots
        if (url.includes("/ballots")) {
            const elecMatch = url.match(/\/elections\/([^\/]+)\/ballots/);
            if (elecMatch && method === 'get') {
                const ballots = ballotsStore.filter(b => b.electionId === elecMatch[1]);
                return ballots.map(b => ({
                    ...b,
                    options: candidatesStore.filter(c => c.ballotId === b.id)
                }));
            }
            if (elecMatch && method === 'post') {
                const newBallot = { id: 'bal-' + Date.now(), electionId: elecMatch[1], status: "DRAFT", ...data };
                ballotsStore.push(newBallot);
                activityLog.push({ id: Date.now(), action: `Created new ballot: ${newBallot.title}`, time: new Date().toISOString(), user: "Admin" });
                return newBallot;
            }
        }

        // Handle publishing/unpublishing/deleting
        const elecIdMatch = url.match(/\/elections\/([^\/]+)/);
        if (elecIdMatch && !url.includes("/ballots")) {
            const eId = elecIdMatch[1];
            if (url.includes("/publish")) {
                const e = electionsStore.find(el => el.id === eId);
                if (e) e.status = "PUBLISHED";
                activityLog.push({ id: Date.now(), action: `Published election ${eId}`, time: new Date().toISOString(), user: "Admin" });
                return { success: true };
            }
            if (url.includes("/unpublish")) {
                const e = electionsStore.find(el => el.id === eId);
                if (e) e.status = "DRAFT";
                activityLog.push({ id: Date.now(), action: `Unpublished election ${eId}`, time: new Date().toISOString(), user: "Admin" });
                return { success: true };
            }
            if (method === 'delete') {
                electionsStore = electionsStore.filter(el => el.id !== eId);
                activityLog.push({ id: Date.now(), action: `Deleted election ${eId}`, time: new Date().toISOString(), user: "Admin" });
                return { success: true };
            }
        }

        if (method === 'get') return electionsStore;
        if (method === 'post') {
            const newElec = { id: 'elec-' + Date.now(), status: "DRAFT", ...data };
            electionsStore.push(newElec);
            activityLog.push({ id: Date.now(), action: `Created new election: ${newElec.title}`, time: new Date().toISOString(), user: "Admin" });
            return newElec;
        }
    }

    // --- BALLOTS & CANDIDATES ---
    if (url.includes("/ballots")) {
        const ballotMatch = url.match(/\/ballots\/([^\/]+)/);
        if (ballotMatch && url.includes("/candidates")) {
            if (method === 'get') {
                return candidatesStore.filter(c => c.ballotId === ballotMatch[1]);
            }
            if (method === 'post') {
                const newCand = { id: 'c-' + Date.now(), ballotId: ballotMatch[1], ...data };
                candidatesStore.push(newCand);
                activityLog.push({ id: Date.now(), action: `Added candidate ${newCand.name} to ballot`, time: new Date().toISOString(), user: "Admin" });
                return newCand;
            }
        }
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
