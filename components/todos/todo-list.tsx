"use client";

import { useIsRestoring } from "@tanstack/react-query";
import {
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { useTodos } from "@/lib/backend/todos";
import type { TodoFilter } from "@/lib/db/queries/todos";
import { Button } from "../ui/button";
import { AddTaskInline } from "./add-task-inline";
import { TodoItem } from "./todo-item";
import { TodoListSkeleton } from "./todo-item-skeleton";

interface TodoListProps {
	filter?: TodoFilter;
}

export function TodoList({ filter }: TodoListProps) {
	const { data: todos, isLoading, error } = useTodos(filter);
	const isRestoring = useIsRestoring();
	const [showCompleted, setShowCompleted] = useState(false);

	if (isLoading || isRestoring) {
		return (
			<div className="flex flex-col">
				<TodoListSkeleton count={5} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 text-center text-destructive">
				Error loading todos
			</div>
		);
	}

	// Separate incomplete and completed tasks
	const incompleteTodos = todos?.filter((todo) => !todo.isCompleted) || [];
	const completedTodos = todos?.filter((todo) => todo.isCompleted) || [];

	const hasTodos = (todos?.length ?? 0) > 0;
	const hasIncomplete = incompleteTodos.length > 0;
	const hasCompleted = completedTodos.length > 0;

	return (
		<div className="flex flex-col pb-20">
			{/* 1. Empty State (No todos at all) */}
			{!hasTodos && (
				<div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground animate-in fade-in duration-500">
					<div className="bg-muted/50 p-4 rounded-full mb-4">
						<ClipboardList className="w-8 h-8 text-muted-foreground/50" />
					</div>
					<h3 className="font-medium text-lg text-foreground mb-1">
						No tasks yet
					</h3>
					<p className="text-sm">Add a task below to get started!</p>
				</div>
			)}

			{/* 2. All active tasks completed (but we have history) */}
			{hasTodos && !hasIncomplete && (
				<div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
					<div className="bg-muted/30 p-3 rounded-full mb-3">
						<CheckCircle2 className="w-6 h-6 text-green-500/50" />
					</div>
					<p className="text-sm font-medium">All active tasks completed!</p>
				</div>
			)}

			{/* 3. Incomplete Todos List */}
			{hasIncomplete && (
				<div className="space-y-0">
					{incompleteTodos.map((todo) => (
						<TodoItem key={todo.id} todo={todo} />
					))}
				</div>
			)}

			{/* 4. Completed Todos Accordion */}
			{hasCompleted && (
				<div className="mt-8 border-t pt-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowCompleted(!showCompleted)}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground -ml-2 h-8 px-2"
					>
						{showCompleted ? (
							<ChevronDown className="h-4 w-4" />
						) : (
							<ChevronRight className="h-4 w-4" />
						)}
						<span className="text-xs font-medium uppercase tracking-wider">
							Completed{" "}
							{completedTodos.length > 0 && `(${completedTodos.length})`}
						</span>
					</Button>

					{showCompleted && (
						<div className="mt-2 space-y-0 animate-in fade-in slide-in-from-top-2 duration-200">
							{/* We apply a slight opacity to completed items to maintain visual hierarchy */}
							<div className="opacity-70 transition-opacity hover:opacity-100">
								{completedTodos.map((todo) => (
									<TodoItem key={todo.id} todo={todo} />
								))}
							</div>
						</div>
					)}
				</div>
			)}

			<div className="mt-6">
				<AddTaskInline />
			</div>
		</div>
	);
}
