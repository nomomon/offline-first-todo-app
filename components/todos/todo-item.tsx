"use client";

import { Calendar, Trash2 } from "lucide-react";
import { type Todo, useDeleteTodo, useUpdateTodo } from "@/lib/backend/todos";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

interface TodoItemProps {
	todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
	const updateTodo = useUpdateTodo();
	const deleteTodo = useDeleteTodo();

	const toggleCompleted = (checked: boolean) => {
		updateTodo.mutate({
			id: todo.id,
			isCompleted: checked,
		});
	};

	const handleDelete = () => {
		deleteTodo.mutate(todo.id);
	};

	const isOverdue =
		todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.isCompleted;
	const isToday =
		todo.dueDate &&
		new Date(todo.dueDate).toDateString() === new Date().toDateString();

	return (
		<div className="group flex items-start gap-3 py-2 px-2 -mx-2 rounded-md hover:bg-accent/50 transition-colors">
			<div className="pt-1">
				<Checkbox
					checked={todo.isCompleted}
					onCheckedChange={toggleCompleted}
					className="rounded-full w-5 h-5 border-2 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
				/>
			</div>
			<div className="flex-1 min-w-0 flex flex-col gap-0.5">
				<span
					className={cn(
						"text-sm font-medium leading-none truncate transition-all",
						todo.isCompleted && "line-through text-muted-foreground",
					)}
				>
					{todo.content}
				</span>

				<div className="flex items-center gap-2 text-xs">
					{todo.description && (
						<span className="text-muted-foreground truncate max-w-[300px]">
							{todo.description}
						</span>
					)}

					{todo.dueDate && (
						<span
							className={cn(
								"flex items-center gap-1",
								isOverdue ? "text-destructive" : "text-green-600", // Green for active/upcoming as requested
								todo.isCompleted && "text-muted-foreground",
							)}
						>
							<Calendar className="w-3 h-3" />
							{new Date(todo.dueDate).toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
								hour: todo.dueDate.includes("T") ? "numeric" : undefined,
								minute: todo.dueDate.includes("T") ? "numeric" : undefined,
							})}
						</span>
					)}
				</div>
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
	);
}
