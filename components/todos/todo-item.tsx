"use client";

import { Trash2 } from "lucide-react";
import { type Todo, useDeleteTodo, useUpdateTodo } from "@/lib/backend/todos";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface TodoItemProps {
	todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
	const updateTodo = useUpdateTodo();
	const deleteTodo = useDeleteTodo();

	const toggleCompleted = () => {
		updateTodo.mutate({
			id: todo.id,
			isCompleted: !todo.isCompleted,
		});
	};

	const handleDelete = () => {
		deleteTodo.mutate(todo.id);
	};

	return (
		<div className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
			<div className="flex items-center gap-3">
				<input
					type="checkbox"
					checked={todo.isCompleted}
					onChange={toggleCompleted}
					className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
				/>
				<div className="flex flex-col">
					<span
						className={cn(
							"font-medium",
							todo.isCompleted && "line-through text-muted-foreground",
						)}
					>
						{todo.content}
					</span>
					{todo.description && (
						<span className="text-sm text-muted-foreground">
							{todo.description}
						</span>
					)}
					{todo.dueDate && (
						<span className="text-xs text-muted-foreground">
							Due: {new Date(todo.dueDate).toLocaleDateString()}
						</span>
					)}
				</div>
			</div>
			<Button
				variant="ghost"
				size="icon"
				onClick={handleDelete}
				className="text-destructive hover:text-destructive/90"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
