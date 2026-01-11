import { Skeleton } from "@/components/ui/skeleton";

export function TodoItemSkeleton() {
	return (
		<div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
			{/* Checkbox skeleton */}
			<div className="pt-0.5">
				<Skeleton className="rounded-full w-5 h-5" />
			</div>

			{/* Content skeleton */}
			<div className="flex-1 min-w-0 flex flex-col gap-1">
				{/* Title skeleton */}
				<Skeleton className="h-4 w-3/4" />

				{/* Description skeleton - shown for consistency in loading state */}
				<div className="flex flex-col gap-1">
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-5/6" />
				</div>
			</div>

			{/* Placeholder for delete button to maintain consistent layout */}
			<div className="h-8 w-8" />
		</div>
	);
}

export function TodoListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="flex flex-col">
			{Array.from({ length: count }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton loaders are static, identical, and never reorder
				<TodoItemSkeleton key={`skeleton-${i}`} />
			))}
		</div>
	);
}
