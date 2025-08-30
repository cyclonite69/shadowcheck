import { sql } from "drizzle-orm";
import { pgTable, pgSchema, text, varchar, timestamp, decimal, integer, boolean, index, bigint, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// G63 Forensics Schema
export const g63Schema = pgSchema("g63");

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const networks = pgTable("networks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ssid: text("ssid"),
  bssid: text("bssid").notNull(),
  frequency: integer("frequency"),
  channel: integer("channel"),
  signal_strength: integer("signal_strength"),
  encryption: text("encryption"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  geom: text("geom"), // PostGIS geometry column
  observed_at: timestamp("observed_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  geomIdx: index("networks_geom_idx").using("gist", table.geom),
  bssidIdx: index("networks_bssid_idx").on(table.bssid),
  observedIdx: index("networks_observed_idx").on(table.observed_at),
}));

export const cells = pgTable("cells", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cell_id: text("cell_id").notNull(),
  lac: integer("lac"),
  mnc: integer("mnc"),
  mcc: integer("mcc"),
  signal_strength: integer("signal_strength"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  geom: text("geom"), // PostGIS geometry column
  observed_at: timestamp("observed_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  geomIdx: index("cells_geom_idx").using("gist", table.geom),
  cellIdIdx: index("cells_cell_id_idx").on(table.cell_id),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNetworkSchema = createInsertSchema(networks).omit({
  id: true,
  created_at: true,
});

export const insertCellSchema = createInsertSchema(cells).omit({
  id: true,
  created_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertNetwork = z.infer<typeof insertNetworkSchema>;
export type Network = typeof networks.$inferSelect;
export type InsertCell = z.infer<typeof insertCellSchema>;
export type Cell = typeof cells.$inferSelect;

// G63 Forensics Tables
export const g63Networks = g63Schema.table("network", {
  bssid: text("bssid").primaryKey(),
  ssid: text("ssid").notNull(),
  frequency: integer("frequency").notNull(),
  capabilities: text("capabilities").notNull(),
  lasttime: bigint("lasttime", { mode: "bigint" }).notNull(),
  lastlat: doublePrecision("lastlat").notNull(),
  lastlon: doublePrecision("lastlon").notNull(),
  type: text("type").default("W").notNull(),
  bestlevel: integer("bestlevel").default(0).notNull(),
  bestlat: doublePrecision("bestlat").default(0).notNull(),
  bestlon: doublePrecision("bestlon").default(0).notNull(),
  rcois: text("rcois").default("").notNull(),
  mfgrid: integer("mfgrid").default(0).notNull(),
  service: text("service").default("").notNull(),
});

export const g63Locations = g63Schema.table("location", {
  _id: bigint("_id", { mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity(),
  bssid: text("bssid").notNull(),
  level: integer("level").notNull(),
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(),
  altitude: doublePrecision("altitude").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  time: bigint("time", { mode: "bigint" }).notNull(),
  external: integer("external").default(0).notNull(),
  mfgrid: integer("mfgrid").default(0).notNull(),
});

// G63 Types
export type G63Network = typeof g63Networks.$inferSelect;
export type G63Location = typeof g63Locations.$inferSelect;
