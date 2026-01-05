"use client";

import { format } from "date-fns";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { type Todo, useUpdateTodo } from "@/lib/backend/todos";
import { TodoForm, type TodoFormValues } from "./todo-form";

interface EditTodoDialogProps {
	todo: Todo;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditTodoDialog({
	todo,
	open,
	onOpenChange,
}: EditTodoDialogProps) {
	const updateTodo = useUpdateTodo();

	const handleSubmit = (values: TodoFormValues) => {
		updateTodo.mutate(
			{
				id: todo.id,
				content: values.content,
				description: values.description || null,
				dueDate: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : null,
				priority: values.priority,
			},
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[85vh] flex flex-col">
				<DialogHeader className="px-6 py-4 border-b shrink-0">
					<DialogTitle>Edit Task</DialogTitle>
					<DialogDescription className="hidden">
						Make changes to your task here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<div className="p-6 overflow-y-auto">
					<TodoForm
						defaultValues={{
							content: todo.content,
							description: todo.description || "",
							dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
							priority: todo.priority,
						}}
						onSubmit={handleSubmit}
						submitLabel="Save Changes"
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
