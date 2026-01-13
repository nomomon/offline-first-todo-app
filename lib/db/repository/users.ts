import { eq } from "drizzle-orm";
import db from "../client";
import { usersTable } from "../schema";

export async function getUsers() {
	const users = await db.select().from(usersTable);
	return users;
}

export async function getUserByEmail(email: string) {
	const users = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email))
		.limit(1);
	return users[0];
}

export async function addUser(user: typeof usersTable.$inferInsert) {
	await db.insert(usersTable).values(user);
}
