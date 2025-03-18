import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export default mongoose.models.Location ||
  mongoose.model("Location", LocationSchema);
