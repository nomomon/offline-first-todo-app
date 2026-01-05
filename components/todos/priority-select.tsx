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
		icon: "text-[var(--priority-1)] fill-[var(--priority-1)]",
		checkbox: {
			base: "bg-[var(--priority-1-surface)] border-[var(--priority-1-border)] text-[var(--priority-1)] hover:border-[var(--priority-1)]",
			checked:
				"data-[state=checked]:bg-[var(--priority-1)]! data-[state=checked]:border-[var(--priority-1)]! data-[state=checked]:text-[var(--priority-contrast)]!",
		},
	},
	2: {
		label: "Priority 2",
		icon: "text-[var(--priority-2)] fill-[var(--priority-2)]",
		checkbox: {
			base: "bg-[var(--priority-2-surface)] border-[var(--priority-2-border)] text-[var(--priority-2)] hover:border-[var(--priority-2)]",
			checked:
				"data-[state=checked]:bg-[var(--priority-2)]! data-[state=checked]:border-[var(--priority-2)]! data-[state=checked]:text-[var(--priority-contrast)]!",
		},
	},
	3: {
		label: "Priority 3",
		icon: "text-[var(--priority-3)] fill-[var(--priority-3)]",
		checkbox: {
			base: "bg-[var(--priority-3-surface)] border-[var(--priority-3-border)] text-[var(--priority-3)] hover:border-[var(--priority-3)]",
			checked:
				"data-[state=checked]:bg-[var(--priority-3)]! data-[state=checked]:border-[var(--priority-3)]! data-[state=checked]:text-[var(--priority-contrast)]!",
		},
	},
	4: {
		label: "Priority 4",
		icon: "text-[var(--priority-4)] fill-[var(--priority-4)]",
		checkbox: {
			base: "bg-[var(--priority-4-surface)] border-[var(--priority-4-border)] text-[var(--priority-4)] hover:border-[var(--priority-4)]",
			checked:
				"data-[state=checked]:bg-[var(--priority-4)]! data-[state=checked]:border-[var(--priority-4)]! data-[state=checked]:text-[var(--priority-contrast)]!",
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
