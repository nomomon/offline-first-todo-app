"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export async function signUp(formData: FormData) {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!name || !email || !password) {
		return { error: "Missing required fields" };
	}

	// Check if user already exists
	const existingUser = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email))
		.limit(1);

	if (existingUser.length > 0) {
		return { error: "User already exists" };
	}

	const hashedPassword = await hash(password, 10);

	try {
		await db.insert(usersTable).values({
			name,
			email,
			password: hashedPassword,
		});
		return { success: true };
	} catch (error) {
		console.error("Signup error:", error);
		return { error: "Something went wrong" };
	}
}
