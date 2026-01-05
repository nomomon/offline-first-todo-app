import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppSidebar } from "@/components/sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth";

export default async function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/login");
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="relative flex h-16 shrink-0 w-full">
					<div className="absolute left-2 top-8 -translate-y-1/2 transition-[top] duration-200 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:top-6">
						<SidebarTrigger />
					</div>
				</header>
				<main className="flex-1 p-4 max-w-3xl w-full m-auto">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
