import mongoose from "mongoose";

const saudaEntrySubSchema = new mongoose.Schema(
  {
    tons: { type: Number, required: true },
    others: { type: String, default: "" },
    saudaNo: { type: String, default: "" },
    finalRate: { type: Number, default: 0 },
    unit: { type: String, required: true },
    commodity: { type: String, required: true },
    sellerName: { type: String, default: "" },
    sellerCompany: { type: String, default: "" },
    deliveryDate: { type: String, default: "" },
  },
  { _id: false }
);

const SaudaEntrySchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    buyer: { type: String },
    seller: { type: String },
    date: { type: String, required: true },
    time: { type: String },
    mobile: { type: String }, // User's mobile number
    saudaEntries: {
      type: Map,
      of: [saudaEntrySubSchema],
    },
    lastUpdated: { type: Date },
  },
  {
    timestamps: true,
  }
);

SaudaEntrySchema.index({ date: 1 });
SaudaEntrySchema.index({ company: 1 });
SaudaEntrySchema.index({ date: 1, company: 1 });

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 6000 },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

SaudaEntrySchema.statics.getNextSaudaNumber = async function (date) {
  let highestExistingNumber = 0;

  if (date) {
    const existingEntries = await this.find({ date });
    for (const entry of existingEntries) {
      if (entry.saudaEntries) {
        for (const [key, list] of entry.saudaEntries.entries()) {
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item.saudaNo) {
                const numericPart = parseInt(item.saudaNo, 10);
                if (
                  !isNaN(numericPart) &&
                  numericPart > highestExistingNumber
                ) {
                  highestExistingNumber = numericPart;
                }
              }
            }
          }
        }
      }
    }
  }

  let counter = await Counter.findOne({ _id: "saudaNumber" });

  if (!counter) {
    counter = await Counter.create({
      _id: "saudaNumber",
      seq: 6000,
    });
  } else if (counter.seq < 6000) {
    counter = await Counter.findByIdAndUpdate(
      { _id: "saudaNumber" },
      { $set: { seq: 6000 } },
      { new: true }
    );
  }

  let nextNumber;

  if (highestExistingNumber >= counter.seq) {
    nextNumber = highestExistingNumber + 1;
    counter = await Counter.findByIdAndUpdate(
      { _id: "saudaNumber" },
      { $set: { seq: nextNumber } },
      { new: true }
    );
  } else {
    nextNumber = counter.seq;
    counter = await Counter.findByIdAndUpdate(
      { _id: "saudaNumber" },
      { $inc: { seq: 1 } },
      { new: true }
    );
  }

  return nextNumber.toString();
};

export default mongoose.models.SaudaEntry ||
  mongoose.model("SaudaEntry", SaudaEntrySchema);
