import { pgTable, varchar, integer, doublePrecision, timestamp, uuid, boolean, text } from 'drizzle-orm/pg-core';

export const awlrStations = pgTable('awlr_stations', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  riverName: varchar('river_name', { length: 100 }).notNull(),
  waterLevelCm: integer('water_level_cm').notNull(),
  alertLevelCm: integer('alert_level_cm').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'NORMAL', 'WASPADA', 'SIAGA', 'AWAS'
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
});

export const citizenReports = pgTable('citizen_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorName: varchar('author_name', { length: 60 }).default('Warga Anonim').notNull(),
  caption: varchar('caption', { length: 280 }).notNull(),
  waterDepthCategory: varchar('water_depth_category', { length: 30 }).notNull(), // 'ANKLE', 'KNEE', 'THIGH', 'CRITICAL'
  depthCmEstimate: integer('depth_cm_estimate'),
  imageUrl: text('image_url'),
  tiktokLiveUrl: text('tiktok_live_url'),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  district: varchar('district', { length: 60 }).notNull(),
  upvotesCount: integer('upvotes_count').default(0).notNull(),
  downvotesCount: integer('downvotes_count').default(0).notNull(),
  isAiVerified: boolean('is_ai_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AWLRStationSelect = typeof awlrStations.$inferSelect;
export type AWLRStationInsert = typeof awlrStations.$inferInsert;
export type CitizenReportSelect = typeof citizenReports.$inferSelect;
export type CitizenReportInsert = typeof citizenReports.$inferInsert;

