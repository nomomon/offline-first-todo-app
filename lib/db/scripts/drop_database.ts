import db from "..";

async function dropDatabase() {
	await db.execute(`DROP TABLE IF EXISTS "users";`);
	await db.execute(`DROP TABLE IF EXISTS "drizzle_migrations";`);
	process.exit(0);
}

dropDatabase();
