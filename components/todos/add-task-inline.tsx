"use client";

import { Calendar, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTodo } from "@/lib/backend/todos";
import { cn } from "@/lib/utils";

export function AddTaskInline() {
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const createTodo = useCreateTodo();

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const parseDate = (text: string): { cleanText: string; date?: string } => {
		const lowerText = text.toLowerCase();
		const today = new Date();
		let date: Date | undefined;
		let cleanText = text;

		// Simple parsing logic
		if (lowerText.includes("today")) {
			date = today;
			cleanText = text.replace(/today/i, "").trim();
		} else if (lowerText.includes("tomorrow")) {
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			date = tomorrow;
			cleanText = text.replace(/tomorrow/i, "").trim();
		}

		// Extract time (e.g., "at 10am", "at 14:00")
		const timeMatch = lowerText.match(/at\s+(\d{1,2}(?::\d{2})?(?:am|pm)?)/);
		if (timeMatch && date) {
			// If we have a date, try to set the time
			// This is a very basic implementation and might need a real library for robust parsing
			// For now, we'll just keep the date part or rely on the backend/date object if we were doing full datetime
		}

		return {
			cleanText,
			date: date ? date.toISOString() : undefined,
		};
	};

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!content.trim()) return;

		const { cleanText, date } = parseDate(content);

		createTodo.mutate(
			{
				content: cleanText,
				dueDate: date,
				isCompleted: false,
			},
			{
				onSuccess: () => {
					setContent("");
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
		<div className="border rounded-lg p-3 shadow-sm bg-card animate-in fade-in zoom-in-95 duration-200">
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<div className="flex flex-col gap-2">
					<Input
						ref={inputRef}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Task name"
						className="border-none shadow-none focus-visible:ring-0 p-0 text-base font-medium placeholder:text-muted-foreground/50"
					/>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
						>
							<Calendar className="w-3 h-3 mr-1" />
							Due date
						</Button>
					</div>
				</div>
				<div className="flex items-center justify-between border-t pt-2 mt-1">
					<div className="flex items-center gap-2">
						{/* Placeholder for extra actions like labels, priority */}
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setIsEditing(false)}
							className="h-8"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={!content.trim() || createTodo.isPending}
							className="h-8 bg-[#db4c3f] hover:bg-[#db4c3f]/90 text-white" // Todoist red color
						>
							Add task
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
