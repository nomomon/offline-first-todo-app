"use client";

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
} from "@/components/ui/sidebar";
import { AddTaskButton } from "./add-task";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const data = {
		navItems: [
			{
				title: "Inbox",
				url: "/inbox",
				icon: Inbox,
				count: 0,
			},
			{
				title: "Today",
				url: "/",
				icon: Calendar1,
				count: 0,
			},
			{
				title: "Future",
				url: "/upcoming",
				icon: CalendarDays,
				count: 0,
			},
			{
				title: "Archive",
				url: "/completed",
				icon: Archive,
				count: 0,
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
								<SidebarMenuButton asChild tooltip={item.title}>
									<Link href={item.url}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
								<SidebarMenuBadge>
									{item.count > 0 ? item.count : null}
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
