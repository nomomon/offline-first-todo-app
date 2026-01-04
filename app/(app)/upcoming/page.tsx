import { TodoList } from "@/components/todos/todo-list";

export default function UpcomingPage() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Upcoming</h1>
			<TodoList filter="upcoming" />
		</div>
	);
}
