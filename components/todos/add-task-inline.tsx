"use client";

import { format } from "date-fns";
import { Calendar, Clock, Flag, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTodo } from "@/lib/backend/todos";
import { cn } from "@/lib/utils";
import { SmartDatePicker } from "./smart-date-picker";

export function AddTaskInline() {
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState<Date | undefined>();
	const inputRef = useRef<HTMLInputElement>(null);
	const createTodo = useCreateTodo();

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!content.trim()) return;

		createTodo.mutate(
			{
				content: content,
				description: description || undefined,
				dueDate: date ? date.toISOString() : undefined,
				isCompleted: false,
			},
			{
				onSuccess: () => {
					setContent("");
					setDescription("");
					setDate(undefined);
					// Keep isEditing true to allow adding multiple tasks
					inputRef.current?.focus();
				},
			},
		);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsEditing(false);
			setContent("");
			setDescription("");
			setDate(undefined);
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
		<div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white animate-in fade-in zoom-in-95 duration-200">
			<form onSubmit={handleSubmit} className="flex flex-col gap-2">
				<Input
					ref={inputRef}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Task name"
					className="text-base font-medium placeholder:text-gray-400 border-none focus-visible:ring-0 p-0 shadow-none"
				/>
				<Textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Description"
					className="text-sm text-gray-600 placeholder:text-gray-400 border-none focus-visible:ring-0 p-0 resize-none min-h-[20px] shadow-none"
				/>

				<div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
					<div className="flex items-center gap-2">
						<SmartDatePicker date={date} setDate={setDate}>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className={cn(
									"h-7 px-2 rounded-md text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-gray-50",
									date && "text-primary border-primary/20 bg-primary/5",
								)}
							>
								<Calendar className="w-4 h-4 mr-1" />
								{date ? format(date, "MMM d") : "Date"}
							</Button>
						</SmartDatePicker>

						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 px-2 rounded-md text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-gray-50"
						>
							<Flag className="w-4 h-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 px-2 rounded-md text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-gray-50"
						>
							<Clock className="w-4 h-4" />
						</Button>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsEditing(false)}
							className="h-8 text-gray-500 hover:bg-gray-100"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!content.trim() || createTodo.isPending}
							className="h-8 bg-[#db4c3f] hover:bg-[#db4c3f]/90 text-white font-medium px-4"
						>
							Add task
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
