import { sql } from "drizzle-orm";
import { pgTable, pgSchema, text, varchar, timestamp, decimal, integer, bigint, doublePrecision, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// App Schema (normalized structure)
export const appSchema = pgSchema("app");

// Normalized WiFi Network Registry
export const networks = appSchema.table("networks", {
  id: bigint("id", { mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity(),
  bssid: text("bssid").notNull().unique(),
  first_seen_at: timestamp("first_seen_at", { withTimezone: true }).notNull(),
  last_seen_at: timestamp("last_seen_at", { withTimezone: true }).notNull(),
  current_ssid: text("current_ssid"),
  current_frequency: integer("current_frequency"),
  current_capabilities: text("current_capabilities"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  bssidIdx: index("idx_networks_bssid").on(table.bssid),
  lastSeenIdx: index("idx_networks_last_seen").on(table.last_seen_at),
}));

// GPS Scan Locations  
export const locations = appSchema.table("locations", {
  id: bigint("id", { mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(), 
  altitude: decimal("altitude", { precision: 8, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 6, scale: 2 }),
  observed_at: timestamp("observed_at", { withTimezone: true }).notNull(),
  device_id: text("device_id").default("termux_import"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueLocationTime: unique().on(table.latitude, table.longitude, table.observed_at),
}));

// Network Observations Junction Table
export const networkObservations = appSchema.table("network_observations", {
  id: bigint("id", { mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity(),
  network_id: bigint("network_id", { mode: "bigint" }).notNull().references(() => networks.id, { onDelete: "cascade" }),
  location_id: bigint("location_id", { mode: "bigint" }).notNull().references(() => locations.id, { onDelete: "cascade" }),
  signal_strength: integer("signal_strength"),
  observed_at: timestamp("observed_at", { withTimezone: true }).notNull(),
  frequency_at_time: integer("frequency_at_time"),
  capabilities_at_time: text("capabilities_at_time"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// GPS Tracking Data (independent)
export const routes = appSchema.table("routes", {
  _id: bigint("_id", { mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity(),
  run_id: integer("run_id").notNull(),
  wifi_visible: integer("wifi_visible").notNull().default(0),
  cell_visible: integer("cell_visible").notNull().default(0),
  bt_visible: integer("bt_visible").notNull().default(0),
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(), 
  altitude: doublePrecision("altitude").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  time: bigint("time", { mode: "bigint" }).notNull(),
});

// IEEE OUI Lookup Table
export const ieeeOuis = appSchema.table("ieee_ouis", {
  assignment: text("assignment").primaryKey(),
  organization_name: text("organization_name"),
  organization_address: text("organization_address"),
});

// User management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNetworkSchema = createInsertSchema(networks).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  created_at: true,
});

export const insertNetworkObservationSchema = createInsertSchema(networkObservations).omit({
  id: true,
  created_at: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  _id: true,
});

export const insertIeeeOuiSchema = createInsertSchema(ieeeOuis);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertNetwork = z.infer<typeof insertNetworkSchema>;
export type Network = typeof networks.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertNetworkObservation = z.infer<typeof insertNetworkObservationSchema>;
export type NetworkObservation = typeof networkObservations.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertIeeeOui = z.infer<typeof insertIeeeOuiSchema>;
export type IeeeOui = typeof ieeeOuis.$inferSelect;

// All data is now unified under the app schema
// Legacy G63 references have been removed in favor of the normalized structure
