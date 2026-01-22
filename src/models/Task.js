import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    sender: {
      type: String, // Mobile number or User ID
      required: true,
    },
    senderName: {
      type: String,
    },
    receivers: [
      {
        mobile: String,
        name: String,
        isRead: { type: Boolean, default: false },
      },
    ],
    content: {
      type: String,
      required: true,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },
    completedBy: {
      type: String, // Name of the user who completed it
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
