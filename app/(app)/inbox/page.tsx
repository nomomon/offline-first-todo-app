import { TodoList } from "@/components/todos/todo-list";

export default function InboxPage() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Inbox</h1>
			<TodoList filter="inbox" />
		</div>
	);
}
