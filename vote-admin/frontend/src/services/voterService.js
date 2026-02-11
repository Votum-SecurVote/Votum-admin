/**
 * UI-only mock voter service for voter approval/rejection.
 * 
 * This provides mock data for users and identity_verification tables
 * so the admin can approve or reject newly registered voters.
 */

// Mock static voter data matching the database schema
const mockVoters = [
  {
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    full_name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 9876543210',
    gender: 'Male',
    date_of_birth: '1995-03-15',
    address: '123 Main Street, Sector 5, New Delhi, Delhi 110001',
    password_hash: 'hashed_password_here',
    status: 'PENDING',
    created_at: '2024-01-15T10:30:00Z',
    verification: {
      verification_id: '660e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      aadhaar_hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      verification_status: 'PENDING',
      verified_at: null,
      aadhaar_image: 'https://via.placeholder.com/400x250/0050a4/ffffff?text=Aadhaar+Card+Front',
    },
  },
  {
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 9876543211',
    gender: 'Female',
    date_of_birth: '1998-07-22',
    address: '456 Park Avenue, Bandra West, Mumbai, Maharashtra 400050',
    password_hash: 'hashed_password_here',
    status: 'PENDING',
    created_at: '2024-01-16T14:20:00Z',
    verification: {
      verification_id: '660e8400-e29b-41d4-a716-446655440002',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      aadhaar_hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
      verification_status: 'PENDING',
      verified_at: null,
      aadhaar_image: 'https://via.placeholder.com/400x250/0050a4/ffffff?text=Aadhaar+Card+Front',
    },
  },
  {
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    full_name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '+91 9876543212',
    gender: 'Male',
    date_of_birth: '1992-11-08',
    address: '789 MG Road, Koramangala, Bangalore, Karnataka 560095',
    password_hash: 'hashed_password_here',
    status: 'PENDING',
    created_at: '2024-01-17T09:15:00Z',
    verification: {
      verification_id: '660e8400-e29b-41d4-a716-446655440003',
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      aadhaar_hash: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
      verification_status: 'PENDING',
      verified_at: null,
      aadhaar_image: 'https://via.placeholder.com/400x250/0050a4/ffffff?text=Aadhaar+Card+Front',
    },
  },
  {
    user_id: '550e8400-e29b-41d4-a716-446655440004',
    full_name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    phone: '+91 9876543213',
    gender: 'Female',
    date_of_birth: '1996-05-30',
    address: '321 Jubilee Hills, Hyderabad, Telangana 500033',
    password_hash: 'hashed_password_here',
    status: 'PENDING',
    created_at: '2024-01-18T16:45:00Z',
    verification: {
      verification_id: '660e8400-e29b-41d4-a716-446655440004',
      user_id: '550e8400-e29b-41d4-a716-446655440004',
      aadhaar_hash: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
      verification_status: 'PENDING',
      verified_at: null,
      aadhaar_image: 'https://via.placeholder.com/400x250/0050a4/ffffff?text=Aadhaar+Card+Front',
    },
  },
  {
    user_id: '550e8400-e29b-41d4-a716-446655440005',
    full_name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 9876543214',
    gender: 'Male',
    date_of_birth: '1994-09-12',
    address: '654 Salt Lake, Kolkata, West Bengal 700064',
    password_hash: 'hashed_password_here',
    status: 'PENDING',
    created_at: '2024-01-19T11:00:00Z',
    verification: {
      verification_id: '660e8400-e29b-41d4-a716-446655440005',
      user_id: '550e8400-e29b-41d4-a716-446655440005',
      aadhaar_hash: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
      verification_status: 'PENDING',
      verified_at: null,
      aadhaar_image: 'https://via.placeholder.com/400x250/0050a4/ffffff?text=Aadhaar+Card+Front',
    },
  },
];

// In-memory store (simulates database)
let voters = [...mockVoters];

export const voterService = {
  // Get all pending voters for approval
  getPendingVoters: async () => {
    return {
      data: voters.filter((v) => v.status === 'PENDING' && v.verification.verification_status === 'PENDING'),
    };
  },

  // Get all voters (for admin view)
  getAllVoters: async () => {
    return { data: voters.slice() };
  },

  // Approve a voter (sets status to APPROVED and verification_status to VERIFIED)
  approveVoter: async (userId) => {
    const voter = voters.find((v) => v.user_id === userId);
    if (!voter) {
      throw new Error('Voter not found');
    }
    voter.status = 'APPROVED';
    voter.verification.verification_status = 'VERIFIED';
    voter.verification.verified_at = new Date().toISOString();
    return { data: voter };
  },

  // Reject a voter (sets status to REJECTED and verification_status to REJECTED)
  // rejectionMessage: reason sent to the voter explaining why they were rejected
  rejectVoter: async (userId, rejectionMessage) => {
    const voter = voters.find((v) => v.user_id === userId);
    if (!voter) {
      throw new Error('Voter not found');
    }
    voter.status = 'REJECTED';
    voter.verification.verification_status = 'REJECTED';
    voter.verification.verified_at = new Date().toISOString();
    voter.rejection_message = rejectionMessage || 'Your registration has been rejected. Please contact support for more information.';
    return { data: voter };
  },
};

export default voterService;
