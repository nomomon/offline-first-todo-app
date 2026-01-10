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

	return (
		<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
			<nav className="flex items-center justify-around h-16 px-2">
				{navItems
					.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.view}
								href={item.href}
								className={cn(
									"flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors rounded-lg",
									currentView === item.view
										? "text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
								onMouseEnter={() => prefetchTodos(item.view)}
							>
								<Icon className="size-5" />
								<span className="text-xs font-medium">{item.label}</span>
							</Link>
						);
					})
					.reduce<React.ReactNode[]>((acc, item, index) => {
						acc.push(item);
						// Insert Add Task button after Inbox (index 1)
						if (index === 1) {
							acc.push(
								<CreateTodoDialog key="add-task">
									<Button
										size="icon"
										className="rounded-full size-12 shadow-lg"
										aria-label="Add task"
									>
										<Plus className="size-6" />
									</Button>
								</CreateTodoDialog>,
							);
						}
						return acc;
					}, [])}

				{/* You Button (User Menu) */}
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground hover:text-foreground p-0 rounded-lg"
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
