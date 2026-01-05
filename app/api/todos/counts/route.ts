import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getTodoCounts } from "@/lib/db/queries/todos";

export async function GET() {
	const user = await getAuthenticatedUser();
	if (!user) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const counts = await getTodoCounts(user.id);
	return NextResponse.json(counts);
}
