import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to read .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

console.log("Reading env from:", envPath);
let envContent;
try {
  envContent = fs.readFileSync(envPath, "utf8");
} catch (e) {
  console.error("Could not read .env.local");
  process.exit(1);
}

const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...val] = line.split("=");
  if (key && val) env[key.trim()] = val.join("=").trim();
});

const uri = env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

console.log("Connecting to DB...");
try {
    await mongoose.connect(uri);
    console.log("Connected.");
} catch(e) {
    console.error("Connection failed:", e);
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  pages: { type: [String], default: [] },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const users = await User.find({}).lean();
console.log(`Found ${users.length} users.`);

users.forEach(u => {
    console.log(`- Name: ${u.name}, Mobile: ${u.mobile} (Type: ${typeof u.mobile}), Password Hash Len: ${u.password?.length}`);
});

if (users.length > 0) {
    // Check type of mobile query
    const firstUser = users[0];
    const strMobile = String(firstUser.mobile);
    console.log(`Querying by string mobile "${strMobile}"...`);
    const found = await User.findOne({ mobile: strMobile }).lean();
    console.log("Found by string?", !!found);
}

console.log("API_KEY in env:", env.API_KEY ? "Present" : "Missing");

process.exit(0);
