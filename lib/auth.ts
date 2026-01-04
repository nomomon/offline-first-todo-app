import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import db from "@/lib/db";
import { getUserByEmail } from "@/lib/db/queries/users";
import { usersTable } from "@/lib/db/schema";

export const authOptions: NextAuthOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const users = await db
					.select()
					.from(usersTable)
					.where(eq(usersTable.email, credentials.email))
					.limit(1);

				if (users.length === 0) {
					return null;
				}

				const user = users[0];

				const isPasswordValid = await compare(
					credentials.password,
					user.password,
				);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id.toString(),
					name: user.name,
					email: user.email,
				};
			},
		}),
	],
	pages: {
		signIn: "/login",
	},
};

export async function getAuthenticatedUser() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.email) {
		return null;
	}

	const user = await getUserByEmail(session.user.email);
	return user || null;
}
