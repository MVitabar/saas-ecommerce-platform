import { SQLDatabase } from "encore.dev/storage/sqldb";

export const searchDB = new SQLDatabase("search", {
  migrations: "./migrations",
});
