import mongoose from "mongoose";

const commoditySchema = new mongoose.Schema({
    name: { type: String, required: true },
    subCategories: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Commodity || mongoose.model("Commodity", commoditySchema);
