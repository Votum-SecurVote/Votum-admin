const axios = require('axios');
const crypto = require('crypto');
const { generateKeyPairSync, publicEncrypt, constants } = require('crypto');

// Config
const API_URL = 'http://localhost:8080/api';
const ADMIN_USER_ID = 'admin-verifier';

// Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const NC = '\x1b[0m';

async function runVerification() {
    console.log("Starting EPIC-1 Verification...");

    try {
        // 1. Fetch Public Key
        console.log("\n[TEST 1] Fetching Public Key...");
        const keyRes = await axios.get(`${API_URL}/auth/public-key`);
        const publicKeyBase64 = keyRes.data.publicKey;
        if (!publicKeyBase64) throw new Error("Public Key not returned");
        console.log(`${GREEN}PASS:${NC} Public Key fetched.`);

        // 2. Encrypt Identity (Client-Side Simulation)
        console.log("\n[TEST 2] Encrypting Payload...");
        const identity = "123456789012";
        const publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
        const encryptedBuffer = publicEncrypt(
            {
                key: publicKey,
                padding: constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            Buffer.from(identity)
        );
        const encryptedIdentity = encryptedBuffer.toString('base64');
        console.log(`${GREEN}PASS:${NC} Identity Encrypted.`);

        // 3. Register Voter
        console.log("\n[TEST 3] Registering Voter...");

        // Login to get token first
        const regLoginRes = await axios.post(`${API_URL}/auth/login`, { userId: 'verifier-voter-1', role: 'VOTER' });
        const regToken = regLoginRes.data.token;

        const regRes = await axios.post(`${API_URL}/voters/register`, {
            identityType: 'National ID',
            identityProof: encryptedIdentity,
            declarationAccepted: true
        }, {
            headers: {
                'Authorization': `Bearer ${regToken}`,
                'x-user-id': 'verifier-voter-1'
            }
        });

        const voterId = regRes.data.voterId;
        if (!voterId) throw new Error("No voterId returned");
        if (regRes.data.status !== 'PENDING') throw new Error(`Status is ${regRes.data.status}, expected PENDING`);
        console.log(`${GREEN}PASS:${NC} Voter Registered (ID: ${voterId}).`);

        // 4. Verify Identity Leaks (Security)
        console.log("\n[TEST 4] Verifying Identity Leakage on /me...");
        try {
            // Login as Voter first to get token
            const loginRes = await axios.post(`${API_URL}/auth/login`, { userId: 'verifier-voter-1', role: 'VOTER' });
            const token = loginRes.data.token;

            const meRes = await axios.get(`${API_URL}/voters/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (meRes.data.status !== 'PENDING') throw new Error("Status mismatch");
            if (meRes.data.encryptedIdentity || meRes.data.identityHash) {
                throw new Error("FAIL: Sensitive data leaked in /me response");
            }
            console.log(`${GREEN}PASS:${NC} /me endpoint secure.`);
        } catch (e) {
            throw new Error(`Failed /me check: ${e.message}`);
        }

        // 5. Admin Logins & Approval
        console.log("\n[TEST 5] Admin Approval Flow...");
        // Login Admin
        const adminLoginRes = await axios.post(`${API_URL}/auth/login`, { userId: ADMIN_USER_ID, role: 'ADMIN' });
        const adminToken = adminLoginRes.data.token;
        const adminConfig = { headers: { 'Authorization': `Bearer ${adminToken}` } };

        // Get Pending
        const pendingRes = await axios.get(`${API_URL}/admin/voters/pending`, adminConfig);
        const pendingVoter = pendingRes.data.find(v => v.id === voterId || v.voterId === voterId); // Adapt to actual response structure
        if (!pendingVoter) throw new Error("Registered voter not found in pending list");
        console.log(`${GREEN}PASS:${NC} Voter found in pending list.`);

        // Approve
        console.log("Approving voter...");
        await axios.put(`${API_URL}/admin/voters/${voterId}/approve`, {}, adminConfig);
        console.log(`${GREEN}PASS:${NC} Voter Approved.`);

        // 6. Immutability Check
        console.log("\n[TEST 6] Verifying Status Immutability...");
        try {
            await axios.put(`${API_URL}/admin/voters/${voterId}/approve`, {}, adminConfig);
            throw new Error("FAIL: Allowed re-approval of APPROVED voter");
        } catch (e) {
            if (e.response && (e.response.status === 400 || e.response.status === 409)) {
                console.log(`${GREEN}PASS:${NC} Re-approval correctly rejected.`);
            } else {
                throw new Error(`Unexpected error on re-approval: ${e.message}`);
            }
        }

        console.log("\n---------------------------------------------------");
        console.log(`${GREEN}ALL VERIFICATION CHECKS PASSED${NC}`);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error(`\n${RED}VERIFICATION FAILED:${NC} ${error.message}`);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        process.exit(1);
    }
}

runVerification();
