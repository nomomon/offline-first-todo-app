import type { NewTodo, Todo, TodoView } from "@/lib/todos/types";

export const normalizeDate = (value?: Date | string | null): string | null => {
	if (!value) return null;
	return typeof value === "string" ? value : value.toISOString().split("T")[0];
};

export function doesTodoMatchView(
	todo: Todo | NewTodo,
	view?: TodoView,
): boolean {
	const isCompleted = "isCompleted" in todo ? todo.isCompleted : false;
	const dueDate = normalizeDate(todo.dueDate);
	const today = new Date().toISOString().split("T")[0];

	if (view === "completed") return isCompleted === true;

	// Allow completed tasks to remain in their respective views
	// based on due date, not just show only incomplete tasks
	if (view === "inbox") return !dueDate;
	if (view === "today") return dueDate !== null && dueDate <= today;
	if (view === "upcoming") return dueDate !== null && dueDate > today;

	return true;
}

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

export const sortTodos = (todos: Todo[] | undefined) =>
	todos ? [...todos].sort(compareTodos) : todos;
