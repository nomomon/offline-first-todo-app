import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

// biome-ignore lint: Forbidden non-null assertion.
const db = drizzle(process.env.DATABASE_URL!);

export default db;
