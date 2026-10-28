import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function makeAdmin() {
  const dbConnect = (await import("./lib/mongodb")).default;
  const { User } = await import("./lib/models");
  
  await dbConnect;
  
  // Update all existing users to be ADMIN for convenience
  const result = await User.updateMany({}, { $set: { role: "ADMIN" } });
  console.log(`Updated ${result.modifiedCount} users to ADMIN role.`);
  
  process.exit(0);
}

makeAdmin().catch(console.error);
