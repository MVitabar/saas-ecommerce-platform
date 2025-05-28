import { SQLDatabase } from "encore.dev/storage/sqldb";

export const productDB = new SQLDatabase("product", {
  migrations: "./migrations",
});
