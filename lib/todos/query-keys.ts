import type { TodoView } from "@/lib/todos/types";

export type TodosQueryKey = readonly ["todos", TodoView?];

export const todosQueryKey = (view?: TodoView): TodosQueryKey => [
	"todos",
	view,
];
export const todoCountsQueryKey = ["todo-counts"] as const;

// Mutation keys MUST remain stable for offline persisted mutations.
export const createTodoMutationKey = ["createTodo"] as const;
export const updateTodoMutationKey = ["updateTodo"] as const;
export const deleteTodoMutationKey = ["deleteTodo"] as const;
