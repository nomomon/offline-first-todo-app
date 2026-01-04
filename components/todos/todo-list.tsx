"use client";

import { useTodos } from "@/lib/backend/todos";
import type { TodoFilter } from "@/lib/db/queries/todos";
import { TodoItem } from "./todo-item";

interface TodoListProps {
	filter?: TodoFilter;
}

export function TodoList({ filter }: TodoListProps) {
	const { data: todos, isLoading, error } = useTodos(filter);

	if (isLoading) {
		return <div className="p-4 text-center">Loading todos...</div>;
	}

	if (error) {
		return (
			<div className="p-4 text-center text-destructive">
				Error loading todos
			</div>
		);
	}

	if (!todos || todos.length === 0) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				No todos found.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{todos.map((todo) => (
				<TodoItem key={todo.id} todo={todo} />
			))}
		</div>
	);
}
