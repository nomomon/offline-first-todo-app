import {
	and,
	asc,
	count,
	desc,
	eq,
	gt,
	isNull,
	lte,
	type SQL,
} from "drizzle-orm";
import db from "..";
import { todosTable } from "../schema";

export type TodoFilter = "inbox" | "today" | "upcoming" | "completed";

export async function getTodoCounts(userId: number) {
	const today = new Date().toISOString().split("T")[0];

	const [inbox] = await db
		.select({ count: count() })
		.from(todosTable)
		.where(
			and(
				eq(todosTable.userId, userId),
				isNull(todosTable.dueDate),
				eq(todosTable.isCompleted, false),
			),
		);

	const [todayCount] = await db
		.select({ count: count() })
		.from(todosTable)
		.where(
			and(
				eq(todosTable.userId, userId),
				lte(todosTable.dueDate, today),
				eq(todosTable.isCompleted, false),
			),
		);

	const [upcoming] = await db
		.select({ count: count() })
		.from(todosTable)
		.where(
			and(
				eq(todosTable.userId, userId),
				gt(todosTable.dueDate, today),
				eq(todosTable.isCompleted, false),
			),
		);

	const [completed] = await db
		.select({ count: count() })
		.from(todosTable)
		.where(
			and(eq(todosTable.userId, userId), eq(todosTable.isCompleted, true)),
		);

	return {
		inbox: inbox.count,
		today: todayCount.count,
		upcoming: upcoming.count,
		completed: completed.count,
	};
}

export async function getTodos(userId: number, filter?: TodoFilter) {
	const conditions: (SQL | undefined)[] = [eq(todosTable.userId, userId)];
	const today = new Date().toISOString().split("T")[0];

	if (filter === "inbox") {
		// Show all tasks with no due date (both completed and incomplete)
		conditions.push(isNull(todosTable.dueDate));
	} else if (filter === "today") {
		// Show all tasks due today or earlier (both completed and incomplete)
		conditions.push(lte(todosTable.dueDate, today));
	} else if (filter === "upcoming") {
		// Show all tasks due in the future (both completed and incomplete)
		conditions.push(gt(todosTable.dueDate, today));
	} else if (filter === "completed") {
		conditions.push(eq(todosTable.isCompleted, true));
	}

	return db
		.select()
		.from(todosTable)
		.where(and(...conditions))
		.orderBy(
			asc(todosTable.isCompleted),
			asc(todosTable.dueDate),
			asc(todosTable.priority),
			desc(todosTable.createdAt),
		);
}

export async function addTodo(todo: typeof todosTable.$inferInsert) {
	return db.insert(todosTable).values(todo).returning();
}

export async function updateTodo(
	id: number,
	userId: number,
	todo: Partial<typeof todosTable.$inferInsert>,
) {
	return db
		.update(todosTable)
		.set(todo)
		.where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)))
		.returning();
}

export async function deleteTodo(id: number, userId: number) {
	return db
		.delete(todosTable)
		.where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)))
		.returning();
}
