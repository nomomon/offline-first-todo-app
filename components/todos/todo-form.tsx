"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PrioritySelect } from "./priority-select";
import { SmartDatePicker } from "./smart-date-picker";

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
								<SmartDatePicker date={field.value} setDate={field.onChange} />
							)}
						/>

						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => (
								<PrioritySelect
									value={field.value}
									onChange={field.onChange}
									triggerClassName="h-7! px-2! font-medium rounded-md text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-gray-50"
								/>
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
