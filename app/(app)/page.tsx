"use client";

import { useSearchParams } from "next/navigation";
import { TodoList } from "@/components/todos/todo-list";
import type { TodoFilter } from "@/lib/db/queries/todos";

const viewConfig: Record<TodoFilter, { title: string; description: string }> = {
	inbox: {
		title: "Inbox",
		description: "Capture everything that lands here.",
	},
	today: {
		title: "Today",
		description: "Focus on what must ship today.",
	},
	upcoming: {
		title: "Upcoming",
		description: "Preview the work that is scheduled next.",
	},
	completed: {
		title: "Archive",
		description: "Browse the tasks you have closed out.",
	},
};

function isValidView(value?: string | null): value is TodoFilter {
	return Boolean(value && value in viewConfig);
}

export default function AppPage() {
	const searchParams = useSearchParams();
	const viewParam = searchParams.get("view");
	const view: TodoFilter = isValidView(viewParam) ? viewParam : "today";
	const { title, description } = viewConfig[view];

	return (
		<div className="max-w-3xl mx-auto py-8 px-4">
			<div className="mb-6 space-y-1">
				<h1 className="text-3xl font-bold">{title}</h1>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			<TodoList filter={view} />
		</div>
	);
}
