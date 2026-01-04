"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateTodo } from "@/lib/backend/todos";

interface CreateTodoSheetProps {
	children: React.ReactNode;
}

export function CreateTodoSheet({ children }: CreateTodoSheetProps) {
	const [open, setOpen] = useState(false);
	const [content, setContent] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const createTodo = useCreateTodo();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		createTodo.mutate(
			{
				content,
				description: description || undefined,
				dueDate: dueDate || undefined,
				isCompleted: false,
			},
			{
				onSuccess: () => {
					setOpen(false);
					setContent("");
					setDescription("");
					setDueDate("");
				},
			},
		);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Add Task</SheetTitle>
					<SheetDescription>
						Create a new task to track your progress.
					</SheetDescription>
				</SheetHeader>
				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="content">Content</Label>
						<Input
							id="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="What needs to be done?"
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="description">Description</Label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add details..."
							className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="dueDate">Due Date</Label>
						<Input
							id="dueDate"
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
						/>
					</div>
					<SheetFooter>
						<SheetClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</SheetClose>
						<Button type="submit" disabled={createTodo.isPending}>
							{createTodo.isPending ? "Saving..." : "Save Task"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
