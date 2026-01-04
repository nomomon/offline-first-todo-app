import { TodoList } from "@/components/todos/todo-list";

export default function AppPage() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Today</h1>
			<TodoList filter="today" />
		</div>
	);
}
