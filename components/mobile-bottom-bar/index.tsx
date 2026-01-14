"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Archive, Calendar1, CalendarDays, Inbox, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreateTodoDialog } from "@/components/todos/create-todo-dialog";
import { Button } from "@/components/ui/button";
import type { TodoFilter } from "@/lib/db/repository/todos";
import { fetchTodos } from "@/lib/todos";
import { cn } from "@/lib/utils";

export function MobileBottomBar() {
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const viewParam = searchParams.get("view");
	const currentView: TodoFilter =
		viewParam === "today" ||
		viewParam === "inbox" ||
		viewParam === "upcoming" ||
		viewParam === "archived"
			? viewParam
			: "today";

	const prefetchTodos = (view: TodoFilter) => {
		queryClient.prefetchQuery({
			queryKey: ["todos", view],
			queryFn: () => fetchTodos(view),
		});
	};

	const navItems = [
		{
			label: "Today",
			icon: Calendar1,
			href: "/?view=today",
			view: "today" as TodoFilter,
		},
		{
			label: "Inbox",
			icon: Inbox,
			href: "/?view=inbox",
			view: "inbox" as TodoFilter,
		},
		{
			label: "Upcoming",
			icon: CalendarDays,
			href: "/?view=upcoming",
			view: "upcoming" as TodoFilter,
		},
		{
			label: "Archived",
			icon: Archive,
			href: "/?view=archived",
			view: "archived" as TodoFilter,
		},
	];

	// Extract icon components using destructuring for maintainability
	const [todayNav, inboxNav, futureNav, archiveNav] = navItems;
	const TodayIcon = todayNav.icon;
	const InboxIcon = inboxNav.icon;
	const FutureIcon = futureNav.icon;
	const ArchiveIcon = archiveNav.icon;

	return (
		<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
			<nav className="flex items-center justify-around h-16 px-2">
				{/* Today */}
				<Link
					href={todayNav.href}
					className={cn(
						"flex flex-col items-center justify-center gap-1 h-full transition-colors rounded-lg px-3",
						currentView === todayNav.view
							? "text-primary"
							: "text-muted-foreground hover:text-foreground",
					)}
					onMouseEnter={() => prefetchTodos(todayNav.view)}
				>
					<TodayIcon className="size-5" />
					<span className="text-xs font-medium">{todayNav.label}</span>
				</Link>

				{/* Inbox */}
				<Link
					href={inboxNav.href}
					className={cn(
						"flex flex-col items-center justify-center gap-1 h-full transition-colors rounded-lg px-3",
						currentView === inboxNav.view
							? "text-primary"
							: "text-muted-foreground hover:text-foreground",
					)}
					onMouseEnter={() => prefetchTodos(inboxNav.view)}
				>
					<InboxIcon className="size-5" />
					<span className="text-xs font-medium">{inboxNav.label}</span>
				</Link>

				{/* Add Task Button */}
				<CreateTodoDialog>
					<Button
						size="icon"
						className="rounded-full size-12 shadow-lg"
						aria-label="Add task"
					>
						<Plus className="size-6" />
					</Button>
				</CreateTodoDialog>

				{/* Upcoming */}
				<Link
					href={futureNav.href}
					className={cn(
						"flex flex-col items-center justify-center gap-1 h-full transition-colors rounded-lg px-3",
						currentView === futureNav.view
							? "text-primary"
							: "text-muted-foreground hover:text-foreground",
					)}
					onMouseEnter={() => prefetchTodos(futureNav.view)}
				>
					<FutureIcon className="size-5" />
					<span className="text-xs font-medium">{futureNav.label}</span>
				</Link>

				{/* Archived */}
				<Link
					href={archiveNav.href}
					className={cn(
						"flex flex-col items-center justify-center gap-1 h-full transition-colors rounded-lg px-2",
						currentView === archiveNav.view
							? "text-primary"
							: "text-muted-foreground hover:text-foreground",
					)}
					onMouseEnter={() => prefetchTodos(archiveNav.view)}
				>
					<ArchiveIcon className="size-5" />
					<span className="text-xs font-medium">{archiveNav.label}</span>
				</Link>
			</nav>
		</div>
	);
}
