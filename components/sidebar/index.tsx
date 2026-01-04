"use client";

import { Archive, Calendar1, CalendarDays } from "lucide-react";
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
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navItems: [
		{
			title: "Today",
			url: "#",
			icon: Calendar1,
		},
		{
			title: "Future",
			url: "#",
			icon: CalendarDays,
		},
		{
			title: "Archive",
			url: "#",
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
								<SidebarMenuButton tooltip={item.title}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
