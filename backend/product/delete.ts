import { api, APIError } from "encore.dev/api";
import { productDB } from "./db";

// Deletes a product.
export const deleteProduct = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/products/:id" },
  async ({ id }) => {
    const result = await productDB.exec`
      DELETE FROM products WHERE id = ${id}
    `;

    // Note: Encore.ts doesn't provide affected rows count, so we'll assume success
    // In a real implementation, you might want to check if the product exists first
  }
);
