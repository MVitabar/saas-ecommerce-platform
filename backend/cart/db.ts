import { SQLDatabase } from "encore.dev/storage/sqldb";

export const cartDB = new SQLDatabase("cart", {
  migrations: "./migrations",
});
