import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  mobileNumbers: {
    type: [String],
    validate: {
      validator: (arr) => arr.every((num) => /^\d{10}$/.test(num)),
      message: 'Each mobile number must be a valid 10-digit number.',
    },
  },
  contactPersons: {
    type: [String],
  },
}, { _id: false });

const commoditySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subcategories: [String],
}, { _id: false });

const ManageCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: "N.A" },
    commodities: [commoditySchema],
    locations: {
      type: [locationSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one location is required.',
      }
    },
  },
  { timestamps: true }
);

export default mongoose.models.ManageCompany ||
  mongoose.model("ManageCompany", ManageCompanySchema);
