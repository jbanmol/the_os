import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, unique } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'user_states' table.
export const userStates = pgTable('user_states', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  state: text('state').notNull(), // JSON string representing AppState
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'daily_ratings' table.
export const dailyRatings = pgTable('daily_ratings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  systemIndexRating: integer('system_index_rating').notNull(),
  totalScore: integer('total_score').notNull(),
  mode: text('mode').notNull(),
  isRecoveryDay: boolean('is_recovery_day').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [
  unique('daily_ratings_user_id_date_unique').on(t.userId, t.date)
]);

export const usersRelations = relations(users, ({ one, many }) => ({
  userState: one(userStates, {
    fields: [users.id],
    references: [userStates.userId],
  }),
  dailyRatings: many(dailyRatings),
}));

export const userStatesRelations = relations(userStates, ({ one }) => ({
  user: one(users, {
    fields: [userStates.userId],
    references: [users.id],
  }),
}));

export const dailyRatingsRelations = relations(dailyRatings, ({ one }) => ({
  user: one(users, {
    fields: [dailyRatings.userId],
    references: [users.id],
  }),
}));
