import mongoose from 'mongoose';

const CloudAccountSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['gdrive', 'mega', 'box', 'pcloud'],
      required: true,
    },
    alias: { type: String, required: true }, // e.g. mega_01, gdrive_01
    email: { type: String, required: true },
    // Encrypted JSON payload: { accessToken, refreshToken, expiresAt } OR { email, password } for MEGA
    encryptedCredentials: { type: String, required: true },
    usedGB: { type: Number, default: 0 },
    totalGB: { type: Number, required: true },
    lastSyncedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.CloudAccount ||
  mongoose.model('CloudAccount', CloudAccountSchema);