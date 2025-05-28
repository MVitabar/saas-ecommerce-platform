import { SQLDatabase } from "encore.dev/storage/sqldb";

export const couponDB = new SQLDatabase("coupon", {
  migrations: "./migrations",
});
