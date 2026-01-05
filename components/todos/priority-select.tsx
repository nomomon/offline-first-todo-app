"use client";

import { Flag } from "lucide-react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const PRIORITY_STYLES = {
	1: {
		label: "Priority 1",
		icon: "text-red-500 fill-red-500",
		checkbox: {
			base: "bg-red-500/20 border-red-500/40 text-red-500/80 hover:border-red-500/60",
			checked:
				"data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 data-[state=checked]:text-white",
		},
	},
	2: {
		label: "Priority 2",
		icon: "text-yellow-500 fill-yellow-500",
		checkbox: {
			base: "bg-yellow-500/20 border-yellow-500/40 text-yellow-600/80 hover:border-yellow-500/60",
			checked:
				"data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 data-[state=checked]:text-white",
		},
	},
	3: {
		label: "Priority 3",
		icon: "text-blue-500 fill-blue-500",
		checkbox: {
			base: "bg-blue-500/20 border-blue-500/40 text-blue-500/80 hover:border-blue-500/60",
			checked:
				"data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white",
		},
	},
	4: {
		label: "Priority 4",
		icon: "text-muted-foreground",
		checkbox: {
			base: "bg-muted-foreground/20 border-muted-foreground/40 text-muted-foreground/80 hover:border-muted-foreground/60",
			checked:
				"data-[state=checked]:bg-muted-foreground data-[state=checked]:border-muted-foreground data-[state=checked]:text-white",
		},
	},
} as const;

export const getPriorityStyle = (value: number | undefined) => {
	const style = PRIORITY_STYLES[value as keyof typeof PRIORITY_STYLES];
	return style ?? PRIORITY_STYLES[4];
};

interface PrioritySelectProps {
	value?: number;
	onChange: (priority: number) => void;
	triggerClassName?: string;
	placeholder?: string;
}

export function PrioritySelect({
	value = 4,
	onChange,
	triggerClassName,
	placeholder,
}: PrioritySelectProps) {
	return (
		<Select
			value={String(value)}
			onValueChange={(val) => onChange(Number(val))}
		>
			<SelectTrigger
				size="sm"
				className={cn(
					"h-8 w-auto border shadow-sm px-3 gap-2 focus:ring-0",
					triggerClassName,
				)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent align="start">
				{Object.entries(PRIORITY_STYLES).map(([priority, option]) => (
					<SelectItem key={priority} value={priority}>
						<div className="flex items-center gap-2">
							<Flag className={cn("h-3 w-3", option.icon)} />
							<span>{option.label}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
