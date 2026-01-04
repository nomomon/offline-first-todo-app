import { AppSidebar } from "@/components/sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="px-3">
						<SidebarTrigger />
					</div>
				</header>
				<main className="flex-1 p-4">Main Content Area</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
