import { TodoList } from "@/components/todos/todo-list";

export default function InboxPage() {
	return (
		<div className="max-w-3xl mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-6">Inbox</h1>
			<TodoList filter="inbox" />
		</div>
	);
}
