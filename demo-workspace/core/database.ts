// demo-workspace/core/database.ts
export const connectDB = () => {
  const dbUrl = process.env.DATABASE_URL;
  const dbUser = process.env.DB_USER;
  const dbPass = process.env.DB_PASSWORD;
  
  console.log(`Connecting to ${dbUrl} with user ${dbUser}...`);
  // Critical credentials check
  if (!dbPass) throw new Error("SECURITY_FAILURE: DB_PASSWORD_MISSING");
};
