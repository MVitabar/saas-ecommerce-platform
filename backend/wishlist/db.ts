import { SQLDatabase } from "encore.dev/storage/sqldb";

export const wishlistDB = new SQLDatabase("wishlist", {
  migrations: "./migrations",
});
