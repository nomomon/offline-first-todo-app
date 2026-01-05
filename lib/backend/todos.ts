import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import type { TodoFilter } from "../db/queries/todos";
import type { todosTable } from "../db/schema";

export type Todo = typeof todosTable.$inferSelect;
export type NewTodo = Omit<
	typeof todosTable.$inferInsert,
	"id" | "userId" | "createdAt"
>;
export type UpdateTodo = Partial<NewTodo>;

export async function fetchTodos(view?: TodoFilter) {
	const response = await axios.get("/api/todos", {
		params: { view },
	});
	return response.data as Todo[];
}

export function useTodos(view?: TodoFilter) {
	return useQuery({
		queryKey: ["todos", view],
		queryFn: () => fetchTodos(view),
	});
}

export function useTodoCounts() {
	return useQuery({
		queryKey: ["todo-counts"],
		queryFn: async () => {
			const response = await axios.get("/api/todos/counts");
			return response.data as {
				inbox: number;
				today: number;
				upcoming: number;
				completed: number;
			};
		},
	});
}

function doesTodoMatchFilter(
	todo: Todo | NewTodo,
	filter?: TodoFilter,
): boolean {
	const isCompleted = "isCompleted" in todo ? todo.isCompleted : false;
	const dueDate = todo.dueDate;
	const today = new Date().toISOString().split("T")[0];

	if (filter === "completed") return isCompleted === true;

	if (isCompleted) return false;

	if (filter === "inbox") return !dueDate;
	if (filter === "today") return dueDate !== null && dueDate <= today;
	if (filter === "upcoming") return dueDate !== null && dueDate > today;

	return true;
}

export function useCreateTodo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (todo: NewTodo) => {
			const response = await axios.post("/api/todos", todo);
			return response.data as Todo;
		},
		onMutate: async (newTodo) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			queryClient.setQueriesData<
				{ queryKey: [string, TodoFilter | undefined] },
				Todo[]
			>({ queryKey: ["todos"] }, (old, query) => {
				const filter = query.queryKey[1];
				if (!doesTodoMatchFilter(newTodo, filter)) return old;

				const optimisticTodo: Todo = {
					id: Math.random(),
					userId: 0,
					createdAt: new Date(),
					isCompleted: false,
					dueDate: null,
					dueTime: null,
					description: null,
					priority: 4,
					...newTodo,
				};

				return old ? [...old, optimisticTodo] : [optimisticTodo];
			});

			return { previousTodos };
		},
		onError: (_err, _newTodo, context) => {
			toast.error("Failed to create todo");
			if (context?.previousTodos) {
				context.previousTodos.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			queryClient.invalidateQueries({ queryKey: ["todo-counts"] });
		},
		onSuccess: () => {
			toast.success("Todo created");
		},
	});
}

export function useUpdateTodo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, ...todo }: UpdateTodo & { id: number }) => {
			const response = await axios.patch(`/api/todos/${id}`, todo);
			return response.data as Todo;
		},
		onMutate: async ({ id, ...updates }) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			queryClient.setQueriesData<
				{ queryKey: [string, TodoFilter | undefined] },
				Todo[]
			>({ queryKey: ["todos"] }, (old, query) => {
				if (!old) return old;

				const filter = query.queryKey[1];

				return old
					.map((todo) => {
						if (todo.id === id) {
							return { ...todo, ...updates };
						}
						return todo;
					})
					.filter((todo) => doesTodoMatchFilter(todo, filter));
			});

			return { previousTodos };
		},
		onError: (_err, _newTodo, context) => {
			toast.error("Failed to update todo");
			if (context?.previousTodos) {
				context.previousTodos.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			queryClient.invalidateQueries({ queryKey: ["todo-counts"] });
		},
		onSuccess: () => {
			toast.success("Todo updated");
		},
	});
}

export function useDeleteTodo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const response = await axios.delete(`/api/todos/${id}`);
			return response.data as Todo;
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			queryClient.setQueriesData<
				{ queryKey: [string, TodoFilter | undefined] },
				Todo[]
			>({ queryKey: ["todos"] }, (old) => {
				if (!old) return old;
				return old.filter((todo) => todo.id !== id);
			});

			return { previousTodos };
		},
		onError: (_err, _id, context) => {
			toast.error("Failed to delete todo");
			if (context?.previousTodos) {
				context.previousTodos.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			queryClient.invalidateQueries({ queryKey: ["todo-counts"] });
		},
		onSuccess: () => {
			toast.success("Todo deleted");
		},
	});
}
