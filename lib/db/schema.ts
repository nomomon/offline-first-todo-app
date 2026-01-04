import {
	boolean,
	date,
	integer,
	pgTable,
	text,
	time,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
	"users",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity({
			name: "users_id_seq",
			startWith: 1,
			increment: 1,
			minValue: 1,
			maxValue: 2147483647,
			cache: 1,
		}),
		name: varchar({ length: 255 }).notNull(),
		email: varchar({ length: 255 }).notNull(),
		password: varchar({ length: 255 }).notNull(),
	},
	(table) => [unique("users_email_unique").on(table.email)],
);

export const todosTable = pgTable("todos", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({
		name: "todos_id_seq",
		startWith: 1,
		increment: 1,
		minValue: 1,
		maxValue: 2147483647,
		cache: 1,
	}),
	userId: integer("user_id")
		.notNull()
		.references(() => usersTable.id),
	content: text("content").notNull(),
	description: text("description"),
	isCompleted: boolean("is_completed").default(false).notNull(),
	dueDate: date("due_date"),
	dueTime: time("due_time"),
	priority: integer("priority").default(4).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
