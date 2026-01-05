/** biome-ignore-all lint: Idk how else to do it */
"use client";

import { Calendar, Trash2 } from "lucide-react";
import { useState } from "react";
import { type Todo, useDeleteTodo, useUpdateTodo } from "@/lib/backend/todos";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { EditTodoDialog } from "./edit-todo-dialog";

interface TodoItemProps {
	todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const updateTodo = useUpdateTodo();
	const deleteTodo = useDeleteTodo();

	const toggleCompleted = (checked: boolean) => {
		updateTodo.mutate({
			id: todo.id,
			isCompleted: checked,
		});
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		deleteTodo.mutate(todo.id);
	};

	const isOverdue =
		todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.isCompleted;

	return (
		<>
			<div
				className="group flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer"
				onClick={() => setIsEditing(true)}
			>
				<div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
					<Checkbox
						checked={todo.isCompleted}
						onCheckedChange={toggleCompleted}
						className="rounded-full w-5 h-5 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all hover:border-primary"
					/>
				</div>
				<div className="flex-1 min-w-0 flex flex-col gap-1">
					<span
						className={cn(
							"text-sm font-medium text-gray-900 leading-tight transition-all",
							todo.isCompleted && "line-through text-gray-500",
						)}
					>
						{todo.content}
					</span>

					{(todo.description || todo.dueDate) && (
						<div className="flex flex-col gap-1">
							{todo.description && (
								<span
									className={cn(
										"text-xs text-gray-500 line-clamp-2",
										todo.isCompleted && "text-gray-400",
									)}
								>
									{todo.description}
								</span>
							)}

							{todo.dueDate && (
								<span
									className={cn(
										"flex items-center gap-1 text-xs",
										isOverdue ? "text-destructive" : "text-gray-500",
										todo.isCompleted && "text-gray-400",
									)}
								>
									<Calendar className="w-3 h-3" />
									{new Date(todo.dueDate).toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
									})}
								</span>
							)}
						</div>
					)}
				</div>

				<Button
					variant="ghost"
					size="icon"
					onClick={handleDelete}
					className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-400 hover:text-destructive transition-opacity"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>

			<EditTodoDialog
				todo={todo}
				open={isEditing}
				onOpenChange={setIsEditing}
			/>
		</>
	);
}
