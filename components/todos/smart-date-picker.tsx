"use client";

import { addDays, format, nextMonday, nextSaturday } from "date-fns";
import {
	Armchair,
	ArrowRight,
	Calendar as CalendarIcon,
	Sun,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SmartDatePickerProps {
	date?: Date;
	setDate: (date?: Date) => void;
	children?: React.ReactNode;
}

export function SmartDatePicker({
	date,
	setDate,
	children,
}: SmartDatePickerProps) {
	const [open, setOpen] = React.useState(false);

	const handleSelect = (newDate?: Date) => {
		setDate(newDate);
		setOpen(false);
	};

	const quickOptions = [
		{
			label: "Today",
			date: new Date(),
			icon: CalendarIcon,
			color: "text-green-600",
			weekday: format(new Date(), "EEE"),
		},
		{
			label: "Tomorrow",
			date: addDays(new Date(), 1),
			icon: Sun,
			color: "text-orange-400",
			weekday: format(addDays(new Date(), 1), "EEE"),
		},
		{
			label: "This weekend",
			date: nextSaturday(new Date()),
			icon: Armchair,
			color: "text-blue-500",
			weekday: format(nextSaturday(new Date()), "EEE"),
		},
		{
			label: "Next week",
			date: nextMonday(new Date()),
			icon: ArrowRight,
			color: "text-purple-500",
			weekday: format(nextMonday(new Date()), "EEE d MMM"),
		},
	];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{children || (
					<Button
						variant={"outline"}
						className={cn(
							"justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? format(date, "PPP") : <span>Pick a date</span>}
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-63 p-0" align="start">
				<div className="p-1 flex flex-col">
					{quickOptions.map((option) => (
						<Button
							key={option.label}
							variant="ghost"
							className="justify-between font-normal h-8 px-2"
							onClick={() => handleSelect(option.date)}
						>
							<div className="flex items-center gap-2">
								<option.icon className={cn("w-4 h-4", option.color)} />
								<span>{option.label}</span>
							</div>
							<span className="text-xs text-muted-foreground">
								{option.weekday}
							</span>
						</Button>
					))}
				</div>
				<Separator />
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleSelect}
					initialFocus
					className="rounded-md border-0"
				/>
			</PopoverContent>
		</Popover>
	);
}
