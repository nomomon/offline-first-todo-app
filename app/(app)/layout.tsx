import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";
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
			<AppSidebar className="max-md:hidden" />
			<SidebarInset>
				<header className="relative flex h-16 shrink-0 w-full max-md:hidden">
					<div className="absolute left-2 top-8 -translate-y-1/2 transition-[top] duration-200 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:top-6">
						<SidebarTrigger />
					</div>
				</header>
				<main className="flex-1 p-4 max-w-3xl w-full m-auto pb-20 md:pb-4">
					{children}
				</main>
			</SidebarInset>
			<MobileBottomBar />
		</SidebarProvider>
	);
}
