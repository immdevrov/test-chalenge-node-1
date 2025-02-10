import { getProductById } from "./product";
import { getUserById } from "./user";
import type { Pool } from "pg";

export type Purchase = {
  user_id: number;
  product_id: number;
  amount: number;
};

export async function makePurchase(
  params: {
    user_id: number;
    product_id: number;
    amount: number;
  },
  pool: Pool
) {
  const { user_id, product_id, amount } = params;
  const product = await getProductById(product_id, pool);
  if (product.amount < amount) {
    throw new Error(`[PURCHASE] NOT ENOUGH GOODS: ${product.name}`);
  }

  const cost = amount * product.price;
  const user = await getUserById(user_id, pool);

  if (user.balance < cost) {
    throw new Error(`[PURCHASE] NOT ENOUGH MONEY`);
  }

  const dbClient = await pool.connect();
  try {
    const insertPurchasesQuery =
      "INSERT INTO purchases(user_id, product_id, price_paid) VALUES ($1, $2, $3);";
    const updateBalanseQuery = "UPDATE users SET balance = $1 WHERE id = $2";
    const updateProductQuery = "UPDATE products SET amount = $1 WHERE id = $2";

    await dbClient.query("BEGIN");
    await dbClient.query(insertPurchasesQuery, [
      user_id,
      product_id,
      product.price,
    ]);
    await dbClient.query(updateBalanseQuery, [user.balance - cost, user.id]);
    await dbClient.query(updateProductQuery, [
      product.amount - amount,
      product.id,
    ]);

    await dbClient.query("COMMIT");
  } catch (e) {
    console.log(e);
    await dbClient.query("ROLLBACK");
    throw new Error("[PURCHASE]: something went wrong");
  } finally {
    dbClient.release();
  }
}
