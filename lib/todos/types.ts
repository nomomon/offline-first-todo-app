import type { TodoFilter } from "@/lib/db/queries/todos";
import type { todosTable } from "@/lib/db/schema";

export type Todo = typeof todosTable.$inferSelect;
export type NewTodo = Omit<
	typeof todosTable.$inferInsert,
	"id" | "userId" | "createdAt"
>;
export type UpdateTodo = Partial<NewTodo>;

export type TodoCounts = {
	inbox: number;
	today: number;
	upcoming: number;
	completed: number;
};

// This is effectively a UI "view" filter (inbox/today/upcoming/completed)
export type TodoView = TodoFilter;
