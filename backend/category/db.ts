import { SQLDatabase } from "encore.dev/storage/sqldb";

export const categoryDB = new SQLDatabase("category", {
  migrations: "./migrations",
});
