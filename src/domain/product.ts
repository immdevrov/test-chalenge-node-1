import type { Pool } from "pg";

export type Product = {
  id: number;
  name: string;
  type: string;
  price: number;
  amount: number;
};

export async function getProductById(id: number, pool: Pool) {
  const { rows } = await pool.query(`SELECT * FROM products WHERE id=${id}`);

  return rows[0] as Product;
}
