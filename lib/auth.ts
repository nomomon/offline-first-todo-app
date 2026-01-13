import { randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import db from "@/lib/db";
import { addUser, getUserByEmail } from "@/lib/db/queries/users";
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
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider !== "github") {
				return true;
			}

			const email = user.email || (profile as { email?: string } | null)?.email;
			if (!email) {
				return false;
			}

			const existing = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.email, email))
				.limit(1);

			if (existing.length > 0) {
				return true;
			}

			const placeholderPassword = await hash(randomUUID(), 10);

			try {
				await addUser({
					name:
						user.name ||
						(profile as { name?: string } | null)?.name ||
						"GitHub User",
					email,
					password: placeholderPassword,
				});
			} catch (error) {
				// Ignore unique constraint races; sign-in can still continue if another request just created the row.
				console.error("GitHub sign-in user create error", error);
			}

			return true;
		},
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
