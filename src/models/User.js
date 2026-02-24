import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: Number, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  pages: { type: [String], default: [] },
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date },
  passwordLastReset: { type: Date, default: Date.now },
  lastReminderSent: { type: Date },
  lastLogin: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
