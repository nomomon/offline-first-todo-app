"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	createTodo,
	deleteTodo,
	fetchTodoCounts,
	fetchTodos,
	updateTodo,
} from "@/lib/todos/api";
import { doesTodoMatchView, sortTodos } from "@/lib/todos/optimistic";
import {
	createTodoMutationKey,
	deleteTodoMutationKey,
	todoCountsQueryKey,
	todosQueryKey,
	updateTodoMutationKey,
} from "@/lib/todos/query-keys";
import type { NewTodo, Todo, TodoView, UpdateTodo } from "@/lib/todos/types";

type UpdateTodosCacheUpdater = (
	todos: Todo[] | undefined,
	view: TodoView | undefined,
) => Todo[] | undefined;

function updateAllTodosCaches(
	queryClient: ReturnType<typeof useQueryClient>,
	updater: UpdateTodosCacheUpdater,
) {
	const todosQueries = queryClient.getQueriesData<Todo[]>({
		queryKey: ["todos"],
	});

	todosQueries.forEach(([queryKey]) => {
		const view = (queryKey as readonly ["todos", TodoView?])[1];
		queryClient.setQueryData<Todo[]>(queryKey, (old) => updater(old, view));
	});
}

export function useTodos(view?: TodoView) {
	return useQuery({
		queryKey: todosQueryKey(view),
		queryFn: () => fetchTodos(view),
	});
}

export function useTodoCounts() {
	return useQuery({
		queryKey: todoCountsQueryKey,
		queryFn: fetchTodoCounts,
	});
}

export function useCreateTodo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createTodoMutationKey,
		mutationFn: createTodo,
		onMutate: async (newTodo: NewTodo) => {
			const todoId = newTodo.id ?? crypto.randomUUID();
			newTodo.id = todoId;

			await queryClient.cancelQueries({ queryKey: ["todos"] });
			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			updateAllTodosCaches(queryClient, (old, view) => {
				if (!doesTodoMatchView(newTodo, view)) return old;

				const optimisticTodo: Todo = {
					id: todoId,
					userId: "",
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

	return useMutation({
		mutationKey: updateTodoMutationKey,
		mutationFn: updateTodo,
		onMutate: async ({ id, ...updates }: UpdateTodo & { id: string }) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });
			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			updateAllTodosCaches(queryClient, (old, view) => {
				if (!old) return old;

				return sortTodos(
					old
						.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
						.filter((todo) => doesTodoMatchView(todo, view)),
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

	return useMutation({
		mutationKey: deleteTodoMutationKey,
		mutationFn: deleteTodo,
		onMutate: async (id: string) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });
			const previousTodos = queryClient.getQueriesData({ queryKey: ["todos"] });

			queryClient.setQueriesData<Todo[]>(
				{ queryKey: ["todos"] },
				(old: Todo[] | undefined) => {
					if (!old) return old;
					return old.filter((todo) => todo.id !== id);
				},
			);

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
