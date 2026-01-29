import mongoose from 'mongoose';

const ballotOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  party: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true
  }
});

const ballotSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  // Semantic version of this ballot for the election (v1, v2, v3...)
  version: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  options: [ballotOptionSchema],
  maxSelections: {
    type: Number,
    default: 1,
    min: 1
  },
  // Whether this ballot version is currently published/active for the election
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
ballotSchema.index({ electionId: 1 });
ballotSchema.index({ electionId: 1, version: 1 }, { unique: true });

export default mongoose.model('Ballot', ballotSchema);