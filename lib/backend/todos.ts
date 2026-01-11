import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "@/lib/axios";
import type { TodoFilter } from "../db/queries/todos";
import type { todosTable } from "../db/schema";

export type Todo = typeof todosTable.$inferSelect;
export type NewTodo = Omit<
	typeof todosTable.$inferInsert,
	"id" | "userId" | "createdAt"
>;
export type UpdateTodo = Partial<NewTodo>;
type TodoCounts = {
	inbox: number;
	today: number;
	upcoming: number;
	completed: number;
};

type TodosQueryKey = readonly ["todos", TodoFilter?];
const todosQueryKey = (view?: TodoFilter): TodosQueryKey => ["todos", view];
const todoCountsQueryKey = ["todo-counts"] as const;

const normalizeDate = (value?: Date | string | null): string | null => {
	if (!value) return null;
	return typeof value === "string" ? value : value.toISOString().split("T")[0];
};

const compareTodos = (a: Todo, b: Todo) => {
	if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;

	const aDue = normalizeDate(a.dueDate);
	const bDue = normalizeDate(b.dueDate);

	if (aDue !== bDue) {
		if (aDue === null) return -1;
		if (bDue === null) return 1;
		if (aDue < bDue) return -1;
		if (aDue > bDue) return 1;
	}

	if (a.priority !== b.priority) return a.priority - b.priority;

	const aCreated = new Date(a.createdAt).getTime();
	const bCreated = new Date(b.createdAt).getTime();

	if (aCreated !== bCreated) return bCreated - aCreated;

	return a.id - b.id;
};

const sortTodos = (todos: Todo[] | undefined) =>
	todos ? [...todos].sort(compareTodos) : todos;

export async function fetchTodos(view?: TodoFilter) {
	const response = await axios.get<Todo[]>("/api/todos", {
		params: { view },
	});
	return response.data;
}

export function useTodos(view?: TodoFilter) {
	return useQuery({
		queryKey: todosQueryKey(view),
		queryFn: () => fetchTodos(view),
	});
}

export function useTodoCounts() {
	return useQuery({
		queryKey: todoCountsQueryKey,
		queryFn: async () => {
			const response = await axios.get<TodoCounts>("/api/todos/counts");
			return response.data;
		},
	});
}

function doesTodoMatchFilter(
	todo: Todo | NewTodo,
	filter?: TodoFilter,
): boolean {
	const isCompleted = "isCompleted" in todo ? todo.isCompleted : false;
	const dueDate = normalizeDate(todo.dueDate);
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

	const updateTodosCache = (
		updater: (
			todos: Todo[] | undefined,
			filter: TodoFilter | undefined,
		) => Todo[] | undefined,
	) => {
		const todosQueries = queryClient.getQueriesData<Todo[]>({
			queryKey: ["todos"],
		});

		todosQueries.forEach(([queryKey]) => {
			const filter = (queryKey as TodosQueryKey)[1];
			queryClient.setQueryData<Todo[]>(queryKey, (old) => updater(old, filter));
		});
	};

	return useMutation({
		mutationKey: ["createTodo"],
		mutationFn: async (todo: NewTodo) => {
			const response = await axios.post<Todo>("/api/todos", todo);
			return response.data;
		},
		onMutate: async (newTodo) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			updateTodosCache((old, filter) => {
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

				return sortTodos(old ? [...old, optimisticTodo] : [optimisticTodo]);
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

	const updateTodosCache = (
		updater: (
			todos: Todo[] | undefined,
			filter: TodoFilter | undefined,
		) => Todo[] | undefined,
	) => {
		const todosQueries = queryClient.getQueriesData<Todo[]>({
			queryKey: ["todos"],
		});

		todosQueries.forEach(([queryKey]) => {
			const filter = (queryKey as TodosQueryKey)[1];
			queryClient.setQueryData<Todo[]>(queryKey, (old) => updater(old, filter));
		});
	};

	return useMutation({
		mutationKey: ["updateTodo"],
		mutationFn: async ({ id, ...todo }: UpdateTodo & { id: number }) => {
			const response = await axios.patch<Todo>(`/api/todos/${id}`, todo);
			return response.data;
		},
		onMutate: async ({ id, ...updates }) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			updateTodosCache((old, filter) => {
				if (!old) return old;

				return sortTodos(
					old
						.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
						.filter((todo) => doesTodoMatchFilter(todo, filter)),
				);
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

	const updateTodosCache = (
		updater: (todos: Todo[] | undefined) => Todo[] | undefined,
	) => {
		queryClient.setQueriesData<Todo[]>(
			{ queryKey: ["todos"] },
			(old: Todo[] | undefined) => updater(old),
		);
	};

	return useMutation({
		mutationKey: ["deleteTodo"],
		mutationFn: async (id: number) => {
			const response = await axios.delete<Todo>(`/api/todos/${id}`);
			return response.data;
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			updateTodosCache((old) => {
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
