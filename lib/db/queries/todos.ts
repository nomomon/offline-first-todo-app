import { eq } from "drizzle-orm";
import db from "../_index";
import { todosTable } from "../schema";

export async function getTodos(userId: number) {
	return db.select().from(todosTable).where(eq(todosTable.userId, userId));
}

export async function addTodo(todo: typeof todosTable.$inferInsert) {
	return db.insert(todosTable).values(todo).returning();
}

export async function updateTodo(
	id: number,
	todo: Partial<typeof todosTable.$inferInsert>,
) {
	return db
		.update(todosTable)
		.set(todo)
		.where(eq(todosTable.id, id))
		.returning();
}

export async function deleteTodo(id: number) {
	return db.delete(todosTable).where(eq(todosTable.id, id)).returning();
}

export async function toggleTodo(id: number) {
	// First fetch the current status to toggle it, or use a raw sql query if preferred.
	// For simplicity with Drizzle's type safety, we can fetch then update,
	// or just pass the new boolean value in updateTodo.
	// However, a dedicated toggle function usually implies just passing the ID.
	// Let's do a fetch and update for now to be safe and explicit.
	const [todo] = await db
		.select({ isCompleted: todosTable.isCompleted })
		.from(todosTable)
		.where(eq(todosTable.id, id));

	if (!todo) {
		throw new Error("Todo not found");
	}

	return db
		.update(todosTable)
		.set({ isCompleted: !todo.isCompleted })
		.where(eq(todosTable.id, id))
		.returning();
}
