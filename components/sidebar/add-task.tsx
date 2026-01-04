import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

export function AddTaskButton() {
	const { state } = useSidebar();

	return (
		<Button size="sm" className="rounded-2xl">
			<Plus />
			<span
				className={cn({
					hidden: state === "collapsed",
				})}
			>
				Add task
			</span>
		</Button>
	);
}
