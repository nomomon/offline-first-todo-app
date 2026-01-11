"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	Calendar1,
	CalendarDays,
	Inbox,
	Laptop,
	LogOut,
	Moon,
	Plus,
	Sun,
	User,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { CreateTodoDialog } from "@/components/todos/create-todo-dialog";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { fetchTodos } from "@/lib/backend/todos";
import type { TodoFilter } from "@/lib/db/queries/todos";
import { cn } from "@/lib/utils";

export function MobileBottomBar() {
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const viewParam = searchParams.get("view");
	const currentView: TodoFilter =
		viewParam === "today" ||
		viewParam === "inbox" ||
		viewParam === "upcoming" ||
		viewParam === "completed"
			? viewParam
			: "today";
	const { data: session } = useSession();
	const { theme, resolvedTheme, setTheme } = useTheme();

	const prefetchTodos = (view: TodoFilter) => {
		queryClient.prefetchQuery({
			queryKey: ["todos", view],
			queryFn: () => fetchTodos(view),
		});
	};

	const currentTheme =
		theme === "system" ? "system" : (resolvedTheme ?? theme ?? "system");

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
			label: "Future",
			icon: CalendarDays,
			href: "/?view=upcoming",
			view: "upcoming" as TodoFilter,
		},
	];

	// Extract icon components (must be PascalCase variables to use as React components)
	const TodayIcon = navItems[0].icon;
	const InboxIcon = navItems[1].icon;
	const FutureIcon = navItems[2].icon;

	return (
		<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
			<nav className="flex items-center justify-around h-16 px-2">
				{/* Today */}
				<Link
					href={navItems[0].href}
					className={cn(
						"flex flex-col items-center justify-center gap-1 h-full transition-colors rounded-lg px-3",
						currentView === navItems[0].view
							? "text-primary"
							: "text-muted-foreground hover:text-foreground",
					)}
					onMouseEnter={() => prefetchTodos(navItems[0].view)}
				>
					<TodayIcon className="size-5" />
					<span className="text-xs font-medium">{navItems[0].label}</span>
				</Link>

				{/* Inbox */}
				<Link
					href={navItems[1].href}
					className={cn(
						"flex flex-col items-center justify-center gap-1 h-full transition-colors rounded-lg px-3",
						currentView === navItems[1].view
							? "text-primary"
							: "text-muted-foreground hover:text-foreground",
					)}
					onMouseEnter={() => prefetchTodos(navItems[1].view)}
				>
					<InboxIcon className="size-5" />
					<span className="text-xs font-medium">{navItems[1].label}</span>
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

				{/* Future */}
				<Link
					href={navItems[2].href}
					className={cn(
						"flex flex-col items-center justify-center gap-1 h-full transition-colors rounded-lg px-3",
						currentView === navItems[2].view
							? "text-primary"
							: "text-muted-foreground hover:text-foreground",
					)}
					onMouseEnter={() => prefetchTodos(navItems[2].view)}
				>
					<FutureIcon className="size-5" />
					<span className="text-xs font-medium">{navItems[2].label}</span>
				</Link>

				{/* You Button (User Menu) */}
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							className="flex flex-col items-center justify-center gap-1 h-full text-muted-foreground hover:text-foreground p-0 rounded-lg px-3"
							aria-label="User menu"
						>
							<User className="size-5" />
							<span className="text-xs font-medium">You</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent
						side="top"
						align="end"
						className="w-56"
						sideOffset={8}
					>
						<div className="space-y-4">
							{session?.user && (
								<div className="space-y-1">
									<p className="text-sm font-medium leading-none">
										{session.user.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{session.user.email}
									</p>
								</div>
							)}

							<div className="space-y-2">
								<p className="text-xs font-medium text-muted-foreground">
									Appearance
								</p>
								<div className="flex gap-2">
									<Button
										variant={currentTheme === "light" ? "default" : "outline"}
										size="sm"
										onClick={() => setTheme("light")}
										className="flex-1"
									>
										<Sun className="size-4" />
										<span className="sr-only">Light</span>
									</Button>
									<Button
										variant={currentTheme === "dark" ? "default" : "outline"}
										size="sm"
										onClick={() => setTheme("dark")}
										className="flex-1"
									>
										<Moon className="size-4" />
										<span className="sr-only">Dark</span>
									</Button>
									<Button
										variant={currentTheme === "system" ? "default" : "outline"}
										size="sm"
										onClick={() => setTheme("system")}
										className="flex-1"
									>
										<Laptop className="size-4" />
										<span className="sr-only">System</span>
									</Button>
								</div>
							</div>

							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={() => signOut()}
							>
								<LogOut className="size-4" />
								Log out
							</Button>
						</div>
					</PopoverContent>
				</Popover>
			</nav>
		</div>
	);
}
