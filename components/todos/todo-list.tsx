"use client";

import { useTodos } from "@/lib/backend/todos";
import type { TodoFilter } from "@/lib/db/queries/todos";
import { AddTaskInline } from "./add-task-inline";
import { TodoItem } from "./todo-item";
import { TodoListSkeleton } from "./todo-item-skeleton";

interface TodoListProps {
	filter?: TodoFilter;
}

export function TodoList({ filter }: TodoListProps) {
	const { data: todos, isLoading, error } = useTodos(filter);

	if (isLoading) {
		return (
			<div className="flex flex-col">
				<TodoListSkeleton count={5} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 text-center text-destructive">
				Error loading todos
			</div>
		);
	}

	// Separate incomplete and completed tasks
	const incompleteTodos = todos?.filter((todo) => !todo.isCompleted) || [];
	const completedTodos = todos?.filter((todo) => todo.isCompleted) || [];
	const hasAnyTodos = incompleteTodos.length > 0 || completedTodos.length > 0;

	return (
		<div className="flex flex-col">
			{hasAnyTodos ? (
				<>
					{/* Incomplete tasks */}
					{incompleteTodos.map((todo) => (
						<TodoItem key={todo.id} todo={todo} />
					))}

					{/* Completed tasks section */}
					{completedTodos.length > 0 && (
						<>
							{incompleteTodos.length > 0 && (
								<div className="mt-6 mb-4 border-t border-border" />
							)}
							<div className="space-y-0">
								{incompleteTodos.length > 0 && (
									<h3 className="text-sm font-medium text-muted-foreground mb-3">
										Completed
									</h3>
								)}
								{completedTodos.map((todo) => (
									<TodoItem key={todo.id} todo={todo} />
								))}
							</div>
						</>
					)}
				</>
			) : (
				<div className="py-8 text-center text-muted-foreground text-sm">
					No tasks yet. Add one below!
				</div>
			)}

			<div className="mt-4">
				<AddTaskInline />
			</div>
		</div>
	);
}
