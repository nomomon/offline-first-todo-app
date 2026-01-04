import { TodoList } from "@/components/todos/todo-list";

export default function CompletedPage() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Archive</h1>
			<TodoList filter="completed" />
		</div>
	);
}
