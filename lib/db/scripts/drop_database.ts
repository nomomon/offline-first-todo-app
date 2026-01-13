import db from "../client";

async function dropDatabase() {
	await db.execute(`DROP TABLE IF EXISTS "todos";`);
	await db.execute(`DROP TABLE IF EXISTS "users";`);
	await db.execute(`DROP TABLE IF EXISTS "drizzle_migrations";`);
	process.exit(0);
}

dropDatabase();
