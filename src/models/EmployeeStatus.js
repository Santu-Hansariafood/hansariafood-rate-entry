import mongoose from "mongoose";

const EmployeeStatusSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, unique: true },
    name: { type: String },
    status: {
      type: String,
      enum: ["active", "busy", "not_available"],
      default: "active",
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

EmployeeStatusSchema.index({ mobile: 1 });

export default mongoose.models.EmployeeStatus ||
  mongoose.model("EmployeeStatus", EmployeeStatusSchema);
