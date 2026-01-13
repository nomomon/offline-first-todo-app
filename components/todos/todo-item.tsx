/** biome-ignore-all lint: Idk how else to do it */
"use client";

import { Calendar, Trash2 } from "lucide-react";
import { useState } from "react";
import { type Todo, useDeleteTodo, useUpdateTodo } from "@/lib/todos";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { EditTodoDialog } from "./edit-todo-dialog";
import { getPriorityStyle } from "./priority-select";

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
	const priorityStyle = getPriorityStyle(todo.priority);
	const checkboxPriorityClasses = priorityStyle.checkbox;

	return (
		<>
			<div
				className="group flex items-start gap-3 py-3 border-b border-border last:border-0 cursor-pointer"
				onClick={() => setIsEditing(true)}
			>
				<div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
					<Checkbox
						checked={todo.isCompleted}
						onCheckedChange={toggleCompleted}
						className={cn(
							"rounded-full w-5 h-5 transition-all",
							checkboxPriorityClasses.base,
							checkboxPriorityClasses.checked,
						)}
					/>
				</div>
				<div className="flex-1 min-w-0 flex flex-col gap-1">
					<span
						className={cn(
							"text-sm font-medium text-foreground leading-tight transition-all",
							todo.isCompleted && "line-through text-muted-foreground",
						)}
					>
						{todo.content}
					</span>

					{(todo.description || todo.dueDate) && (
						<div className="flex flex-col gap-1">
							{todo.description && (
								<span
									className={cn(
										"text-xs text-muted-foreground line-clamp-2",
										todo.isCompleted && "text-muted-foreground/80",
									)}
								>
									{todo.description}
								</span>
							)}

							{todo.dueDate && (
								<span
									className={cn(
										"flex items-center gap-1 text-xs",
										isOverdue ? "text-destructive" : "text-muted-foreground",
										todo.isCompleted && "text-muted-foreground/80",
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
					className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
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
