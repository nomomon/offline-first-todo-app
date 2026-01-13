"use client";

import { format } from "date-fns";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateTodo } from "@/lib/todos";
import { TodoForm, type TodoFormValues } from "./todo-form";

interface CreateTodoDialogProps {
	children: React.ReactNode;
}

export function CreateTodoDialog({ children }: CreateTodoDialogProps) {
	const [open, setOpen] = useState(false);
	const createTodo = useCreateTodo();

	const handleSubmit = (values: TodoFormValues) => {
		createTodo.mutate(
			{
				content: values.content,
				description: values.description || undefined,
				dueDate: values.dueDate
					? format(values.dueDate, "yyyy-MM-dd")
					: undefined,
				priority: values.priority,
				isCompleted: false,
			},
			{
				onSuccess: () => {
					setOpen(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[85vh] flex flex-col">
				<DialogHeader className="px-6 py-4 border-b shrink-0">
					<DialogTitle>Add Task</DialogTitle>
					<DialogDescription className="hidden">
						Create a new task to track your progress.
					</DialogDescription>
				</DialogHeader>
				<div className="p-6 overflow-y-auto">
					<TodoForm
						onSubmit={handleSubmit}
						onCancel={() => setOpen(false)}
						submitLabel="Add Task"
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
