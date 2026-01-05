"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Archive, Calendar1, CalendarDays, Inbox } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { AppLogo } from "@/components/sidebar/app-logo";
import { NavUser } from "@/components/sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { fetchTodos, useTodoCounts } from "@/lib/backend/todos";
import type { TodoFilter } from "@/lib/db/queries/todos";
import { AddTaskButton } from "./add-task";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const queryClient = useQueryClient();
	const { isMobile, setOpenMobile } = useSidebar();

	const { data: counts } = useTodoCounts();

	const closeOnMobile = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const prefetchTodos = (view: TodoFilter) => {
		queryClient.prefetchQuery({
			queryKey: ["todos", view],
			queryFn: () => fetchTodos(view),
		});
	};

	const data = {
		navItems: [
			{
				title: "Inbox",
				url: "/?view=inbox",
				icon: Inbox,
				count: counts?.inbox ?? 0,
				view: "inbox" as TodoFilter,
			},
			{
				title: "Today",
				url: "/?view=today",
				icon: Calendar1,
				count: counts?.today ?? 0,
				view: "today" as TodoFilter,
			},
			{
				title: "Future",
				url: "/?view=upcoming",
				icon: CalendarDays,
				count: counts?.upcoming ?? 0,
				view: "upcoming" as TodoFilter,
			},
			{
				title: "Archive",
				url: "/?view=completed",
				icon: Archive,
				count: counts?.completed ?? 0,
				view: "completed" as TodoFilter,
			},
		],
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<AppLogo />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<AddTaskButton />
				</SidebarGroup>
				<SidebarGroup>
					<SidebarMenu>
						{data.navItems.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									onClick={closeOnMobile}
									onMouseEnter={() => prefetchTodos(item.view)}
								>
									<Link href={item.url}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
								<SidebarMenuBadge>
									{item.count > 0 ? (
										<span className="animate-fade-in">{item.count}</span>
									) : null}
								</SidebarMenuBadge>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
