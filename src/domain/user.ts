import type { Pool } from "pg";

export type User = {
  id: number;
  name: string;
  balance: number;
};

export async function getUserById(id: number, pool: Pool) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE id=${id}`);
  return rows[0] as User;
}
