import type { TodoFilter } from "@/lib/db/repository/todos";
import type { todosTable } from "@/lib/db/schema";

export type Todo = typeof todosTable.$inferSelect;
export type NewTodo = Omit<
	typeof todosTable.$inferInsert,
	"userId" | "createdAt"
>;
export type UpdateTodo = Partial<NewTodo>;

export type TodoCounts = {
	inbox: number;
	today: number;
	upcoming: number;
	archived: number;
};

// This is effectively a UI "view" filter (inbox/today/upcoming/archived)
export type TodoView = TodoFilter;
