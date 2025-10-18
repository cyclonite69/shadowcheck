import { pgTable, serial, text, integer, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

export type User = { id: string; name: string; username: string; /* add more */ };
export type InsertUser = Omit<User, 'id'>;
export type Network = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  ssid: string;
  bssid: string;
  signal_strength: number;
  encryption: string;
  observed_at: Date;
  geom: any; // Placeholder for PostGIS geometry type
  /* add more */
};
export type InsertNetwork = Omit<Network, 'id'>;
export type LegacyNetwork = { /* legacy fields */ };
export type LegacyLocation = { /* legacy fields */ };

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Changed to text for UUIDs
  name: text('name').notNull(),
  username: text('username').notNull().unique(), // Added username
  createdAt: timestamp('created_at').defaultNow(),
});

export const networks = pgTable('networks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  ssid: text('ssid').notNull(),
  bssid: text('bssid').notNull().unique(),
  signal_strength: integer('signal_strength').notNull(),
  encryption: text('encryption').notNull(),
  observed_at: timestamp('observed_at').defaultNow().notNull(),
  // geom: geometry('geom', { type: 'Point', srid: 4326 }), // PostGIS geometry type, requires specific Drizzle adapter
});

export const cells = pgTable('cells', {
  id: serial('id').primaryKey(),
  networkId: integer('network_id').references(() => networks.id),
});