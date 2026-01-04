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
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { AddTaskButton } from "./add-task";

// This is sample data.
const data = {
	navItems: [
		{
			title: "Inbox",
			url: "/inbox",
			icon: Inbox,
		},
		{
			title: "Today",
			url: "/",
			icon: Calendar1,
		},
		{
			title: "Future",
			url: "/upcoming",
			icon: CalendarDays,
		},
		{
			title: "Archive",
			url: "/completed",
			icon: Archive,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
