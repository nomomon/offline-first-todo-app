import db from "../_index";
import { usersTable } from "../schema";

export async function getUsers() {
	const users = await db.select().from(usersTable);
	return users;
}

export async function addUser(user: typeof usersTable.$inferInsert) {
	await db.insert(usersTable).values(user);
}
