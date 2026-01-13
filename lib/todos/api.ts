import axios from "@/lib/axios";
import type {
	NewTodo,
	Todo,
	TodoCounts,
	TodoView,
	UpdateTodo,
} from "@/lib/todos/types";

export async function fetchTodos(view?: TodoView) {
	const response = await axios.get<Todo[]>("/api/todos", {
		params: { view },
	});
	return response.data;
}

export async function fetchTodoCounts() {
	const response = await axios.get<TodoCounts>("/api/todos/counts");
	return response.data;
}

export async function createTodo(todo: NewTodo): Promise<Todo> {
	const response = await axios.post<Todo>("/api/todos", todo);
	return response.data;
}

export async function updateTodo(
	params: UpdateTodo & { id: string },
): Promise<Todo> {
	const { id, ...todo } = params;
	const response = await axios.patch<Todo>(`/api/todos/${id}`, todo);
	return response.data;
}

export async function deleteTodo(id: string): Promise<Todo> {
	const response = await axios.delete<Todo>(`/api/todos/${id}`);
	return response.data;
}
