import { SQLDatabase } from "encore.dev/storage/sqldb";

export const orderDB = new SQLDatabase("order", {
  migrations: "./migrations",
});
