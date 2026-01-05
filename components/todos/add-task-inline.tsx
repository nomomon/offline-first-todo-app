"use client";

import { format } from "date-fns";
import { Calendar, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTodo } from "@/lib/backend/todos";
import { cn } from "@/lib/utils";
import { PrioritySelect } from "./priority-select";
import { SmartDatePicker } from "./smart-date-picker";

export function AddTaskInline() {
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
		setDate(undefined);
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

	if (!isEditing) {
		return (
			<Button
				variant="ghost"
				onClick={() => setIsEditing(true)}
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

				<div className="flex items-center justify-between pt-2 border-t border-border mt-2">
					<div className="flex items-center gap-2">
						<SmartDatePicker date={date} setDate={setDate}>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className={cn(
									"h-7 px-2 rounded-md text-muted-foreground border-border hover:text-foreground hover:bg-muted/60",
									date && "text-primary border-primary/20 bg-primary/5",
								)}
							>
								<Calendar className="w-4 h-4 mr-1" />
								{date ? format(date, "MMM d") : "Date"}
							</Button>
						</SmartDatePicker>

						<PrioritySelect
							value={priority}
							onChange={setPriority}
							triggerClassName="h-7! px-2! font-medium rounded-md text-muted-foreground border-border hover:text-foreground hover:bg-muted/60"
						/>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							onClick={exitEditing}
							className="h-8 text-muted-foreground hover:bg-muted/70"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!content.trim() || createTodo.isPending}
							className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4"
						>
							Add task
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
