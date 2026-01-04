import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { addTodo, getTodos, type TodoFilter } from "@/lib/db/queries/todos";

export async function GET(request: Request) {
	const user = await getAuthenticatedUser();
	if (!user) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const view = searchParams.get("view") as TodoFilter | undefined;

	const todos = await getTodos(user.id, view);
	return NextResponse.json(todos);
}

export async function POST(request: Request) {
	const user = await getAuthenticatedUser();
	if (!user) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const body = await request.json();
	const newTodo = await addTodo({
		...body,
		userId: user.id,
	});

	return NextResponse.json(newTodo[0]);
}
