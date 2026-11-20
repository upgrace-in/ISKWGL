
import mongoose from 'mongoose';

const VirtualItemSchema = new mongoose.Schema(
  {
    remoteId: {
      type: String,
      required: true,
      index: true,
    },

    remoteParentId: {
      type: String,
      default: null,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['file', 'folder'],
      required: true,
    },

    sizeBytes: {
      type: Number,
      default: 0,
    },

    mimeType: {
      type: String,
      default: '',
    },

    // Google Drive shortcut information
    isShortcut: {
      type: Boolean,
      default: false,
    },

    targetRemoteId: {
      type: String,
      default: null,
    },

    targetMimeType: {
      type: String,
      default: '',
    },

    // MongoDB parent reference
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VirtualItem',
      default: null,
      index: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CloudAccount',
      required: true,
      index: true,
    },

    // Used to safely replace an old sync
    syncBatchId: {
      type: String,
      required: true,
      index: true,
    },

    updatedAtStr: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// A Drive item should be unique within an account.
VirtualItemSchema.index(
  { accountId: 1, remoteId: 1 }
);

export default mongoose.models.VirtualItem ||
  mongoose.model('VirtualItem', VirtualItemSchema);
