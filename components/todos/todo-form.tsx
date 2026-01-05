"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PrioritySelect } from "./priority-select";

const todoFormSchema = z.object({
	content: z.string().min(1, "Content is required"),
	description: z.string().optional(),
	dueDate: z.date().optional(),
	priority: z.number().min(1).max(4),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;

interface TodoFormProps {
	defaultValues?: Partial<TodoFormValues>;
	onSubmit: (values: TodoFormValues) => void;
	submitLabel?: string;
	onCancel?: () => void;
}

export function TodoForm({
	defaultValues,
	onSubmit,
	submitLabel = "Save",
	onCancel,
}: TodoFormProps) {
	const form = useForm<TodoFormValues>({
		resolver: zodResolver(todoFormSchema),
		defaultValues: {
			content: "",
			description: "",
			priority: 4,
			...defaultValues,
		},
	});

	const handleCancel = () => {
		form.reset();
		onCancel?.();
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col h-full"
			>
				<div className="flex flex-col flex-1 gap-4">
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className="flex items-center gap-3">
										<div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
										<Input
											placeholder="Task name"
											className="border-none shadow-none text-xl font-semibold px-0 focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										placeholder="Description"
										className="resize-none border-none shadow-none px-8 focus-visible:ring-0 min-h-[100px] placeholder:text-muted-foreground/50"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex items-center gap-2 px-8">
						<FormField
							control={form.control}
							name="dueDate"
							render={({ field }) => (
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className={cn(
												"h-8 px-3 text-xs font-normal",
												!field.value && "text-muted-foreground",
											)}
										>
											{field.value ? (
												format(field.value, "MMM d")
											) : (
												<>
													<Plus className="mr-2 h-3 w-3" />
													Due Date
												</>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
												date < new Date(new Date().setHours(0, 0, 0, 0))
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							)}
						/>

						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => (
								<PrioritySelect value={field.value} onChange={field.onChange} />
							)}
						/>
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-6 border-t mt-6">
					<Button type="button" variant="secondary" onClick={handleCancel}>
						Cancel
					</Button>
					<Button type="submit">{submitLabel}</Button>
				</div>
			</form>
		</Form>
	);
}
