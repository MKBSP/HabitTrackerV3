
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const habits = pgTable('habits', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    userId: text('user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});