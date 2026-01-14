"use client";

import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TodoFilter } from "@/lib/db/repository/todos";
import { useCreateTodo } from "@/lib/todos";
import { PrioritySelect } from "./priority-select";
import { SmartDatePicker } from "./smart-date-picker";

interface AddTaskInlineProps {
	filter?: TodoFilter;
}

export function AddTaskInline({ filter }: AddTaskInlineProps) {
	const allowCreate = filter !== "upcoming" && filter !== "completed";
	const defaultDate = filter === "today" ? new Date() : undefined;

	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState<Date | undefined>();
	const [priority, setPriority] = useState(4);
	const inputRef = useRef<HTMLInputElement>(null);
	const createTodo = useCreateTodo();

	const resetForm = () => {
		setContent("");
		setDescription("");
		setDate(defaultDate);
		setPriority(4);
	};

	const exitEditing = () => {
		resetForm();
		setIsEditing(false);
	};

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		const trimmedContent = content.trim();
		if (!trimmedContent) return;

		createTodo.mutate(
			{
				content: trimmedContent,
				description: description.trim() || undefined,
				dueDate: date ? format(date, "yyyy-MM-dd") : undefined,
				isCompleted: false,
				priority,
			},
			{
				onSuccess: () => {
					resetForm();
					// Keep isEditing true to allow adding multiple tasks
					inputRef.current?.focus();
				},
			},
		);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			exitEditing();
		}
	};

	if (!allowCreate) return null;

	if (!isEditing) {
		return (
			<Button
				variant="ghost"
				onClick={() => {
					setDate(defaultDate);
					setIsEditing(true);
				}}
				className="w-full justify-start gap-2 px-2 text-muted-foreground hover:text-primary group"
			>
				<div className="flex items-center justify-center w-6 h-6 rounded-full text-primary group-hover:bg-primary/10">
					<Plus className="w-4 h-4" />
				</div>
				<span className="text-sm font-medium">Add task</span>
			</Button>
		);
	}

	return (
		<div className="border border-border rounded-xl p-4 shadow-sm bg-card text-card-foreground animate-in fade-in zoom-in-95 duration-200">
			<form onSubmit={handleSubmit} className="flex flex-col gap-2">
				<Input
					ref={inputRef}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Task name"
					className="text-base font-medium text-foreground placeholder:text-muted-foreground border-none focus-visible:ring-0 p-0 shadow-none"
				/>
				<Textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Description"
					className="text-sm text-foreground/80 placeholder:text-muted-foreground border-none focus-visible:ring-0 p-0 resize-none min-h-[20px] shadow-none"
				/>

				<div className="flex flex-col gap-3 pt-2 mt-2 border-t border-border sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<SmartDatePicker date={date} setDate={setDate} />

						<PrioritySelect value={priority} onChange={setPriority} />
					</div>
					<div className="flex flex-col-reverse w-full gap-2 sm:w-auto sm:flex-row sm:items-center">
						<Button
							type="button"
							variant="ghost"
							onClick={exitEditing}
							className="h-8 w-full text-muted-foreground hover:bg-muted/70 sm:w-auto"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!content.trim() || createTodo.isPending}
							className="h-8 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 sm:w-auto"
						>
							Add task
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
