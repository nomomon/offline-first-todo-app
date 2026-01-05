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

const PRIORITY_OPTIONS = [
	{ value: 1, label: "Priority 1", colorClass: "text-red-500 fill-red-500" },
	{
		value: 2,
		label: "Priority 2",
		colorClass: "text-yellow-500 fill-yellow-500",
	},
	{ value: 3, label: "Priority 3", colorClass: "text-blue-500 fill-blue-500" },
	{ value: 4, label: "Priority 4", colorClass: "text-muted-foreground" },
] as const;

const getPriorityColor = (value: number | undefined) => {
	const option = PRIORITY_OPTIONS.find((item) => item.value === value);
	return option?.colorClass ?? "text-muted-foreground";
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
				className={cn(
					"h-8 w-auto border shadow-sm px-3 gap-2 focus:ring-0",
					triggerClassName,
				)}
			>
				<SelectValue placeholder={placeholder} className="hidden" />
			</SelectTrigger>
			<SelectContent align="start">
				{PRIORITY_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={String(option.value)}>
						<div className="flex items-center gap-2">
							<Flag className={cn("h-3 w-3", option.colorClass)} />
							<span>{option.label}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
