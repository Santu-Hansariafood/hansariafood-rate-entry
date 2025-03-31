import mongoose from "mongoose";

const userCompanySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companies: [
      {
        companyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ManageCompany",
          required: true,
        },
        locations: [{
          type: String,
          required: true,
        }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserCompany = mongoose.models.UserCompany || mongoose.model("UserCompany", userCompanySchema);

export default UserCompany; 