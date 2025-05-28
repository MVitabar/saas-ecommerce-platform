import { SQLDatabase } from "encore.dev/storage/sqldb";

export const reviewDB = new SQLDatabase("review", {
  migrations: "./migrations",
});
