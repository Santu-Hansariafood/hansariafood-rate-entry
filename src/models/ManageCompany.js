import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumbers: {
      type: [String],
      validate: {
        validator: (arr) => arr.every((num) => /^\d{10}$/.test(num)),
        message: "Each mobile number must be a valid 10-digit number.",
      },
    },
    contactPersons: {
      type: [String],
    },
  },
  { _id: true }
);

const commoditySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subcategories: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: true }
);

const ManageCompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: "N.A",
      trim: true,
    },
    commodities: {
      type: [commoditySchema],
      default: [],
    },
    locations: {
      type: [locationSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one location is required.",
      },
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ManageCompany ||
  mongoose.model("ManageCompany", ManageCompanySchema);
