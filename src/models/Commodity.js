import mongoose from "mongoose";

const commoditySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});

export default mongoose.models.Commodity || mongoose.model("Commodity", commoditySchema);
