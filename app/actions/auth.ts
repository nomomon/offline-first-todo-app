"use server";

import { hash } from "bcryptjs";
import { addUser, getUserByEmail } from "@/lib/db/repository/users";

export async function signUp(formData: FormData) {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!name || !email || !password) {
		return { error: "Missing required fields" };
	}

	// Check if user already exists
	const existingUser = await getUserByEmail(email);

	if (existingUser) {
		return { error: "User already exists" };
	}

	const hashedPassword = await hash(password, 10);

	try {
		await addUser({
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
