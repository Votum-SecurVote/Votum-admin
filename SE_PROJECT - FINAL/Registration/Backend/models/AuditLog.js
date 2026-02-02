// models/AuditLog.js
import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    role: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = model('AuditLog', auditLogSchema);

export default AuditLog;