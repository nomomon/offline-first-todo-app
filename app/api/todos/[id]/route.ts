import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { deleteTodo, updateTodo } from "@/lib/db/repository/todos";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await getAuthenticatedUser();
	if (!user) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const { id } = await params;
	const body = await request.json();

	const updated = await updateTodo(id, user.id, body);
	return NextResponse.json(updated[0]);
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const user = await getAuthenticatedUser();
	if (!user) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const { id } = await params;
	const deleted = await deleteTodo(id, user.id);
	return NextResponse.json(deleted[0]);
}
