import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { TodoFilter } from "../db/queries/todos";
import type { todosTable } from "../db/schema";

export type Todo = typeof todosTable.$inferSelect;
export type NewTodo = Omit<
	typeof todosTable.$inferInsert,
	"id" | "userId" | "createdAt"
>;
export type UpdateTodo = Partial<NewTodo>;

export function useTodos(view?: TodoFilter) {
	const call = async () => {
		const response = await axios.get("/api/todos", {
			params: { view },
		});
		return response.data as Todo[];
	};

	return useQuery({
		queryKey: ["todos", view],
		queryFn: call,
	});
}

export function useCreateTodo() {
	const queryClient = useQueryClient();

	const call = async (todo: NewTodo) => {
		const response = await axios.post("/api/todos", todo);
		return response.data as Todo;
	};

	return useMutation({
		mutationFn: call,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});
}

export function useUpdateTodo() {
	const queryClient = useQueryClient();

	const call = async ({ id, ...todo }: UpdateTodo & { id: number }) => {
		const response = await axios.patch(`/api/todos/${id}`, todo);
		return response.data as Todo;
	};

	return useMutation({
		mutationFn: call,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});
}

export function useDeleteTodo() {
	const queryClient = useQueryClient();

	const call = async (id: number) => {
		const response = await axios.delete(`/api/todos/${id}`);
		return response.data as Todo;
	};

	return useMutation({
		mutationFn: call,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});
}
