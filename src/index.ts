import express from "express";
import { createClient } from "redis";
import { composeItems } from "./api";
import { pool, init as databaseInit } from "./database";
import { makePurchase } from "./domain/purchase";

const app = express();
const port = 3000;

const redis = createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`,
});

(async () => await databaseInit())();

redis.connect().catch(console.error);

app.get("/ping", async (_req, res) => {
  try {
    res.json({
      message: "pong",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/items", async (req, res) => {
  try {
    const { app_id: a, currency: c } = req.query;
    const appId = a ? Number(a) : 730;
    const currency = c ? String(c) : "EUR";

    const getCacheKey = (appId: number, currency: string) =>
      `items-${appId}-${currency}`;
    const cachedData = await redis.get(getCacheKey(appId, currency));

    if (cachedData) {
      res.json(JSON.parse(cachedData));
    } else {
      const response = await composeItems(appId, currency);
      await redis.setEx(
        getCacheKey(appId, currency),
        5 * 60,
        JSON.stringify(response)
      );
      res.json(response);
    }
  } catch (error) {
    console.error("Error fetching data from third-party API:", error);
    res.status((error as any).status).json({ error });
  }
});

app.get("/purchase", async (req, res) => {
  const { user_id, product_id, amount } = req.query;
  if (!user_id || !product_id || !amount) {
    console.error(
      "[PURCHASE: missing required params: user_id, item_id, amount]"
    );
    res.status(422).json({
      error: "[PURCHASE: missing required params: user_id, item_id, amount]",
    });
  }

  try {
    await makePurchase(
      {
        user_id: Number(user_id),
        product_id: Number(product_id),
        amount: Number(amount),
      },
      pool
    );

    res.json({ message: "purchased sucessflully" });
  } catch (e) {
    const errorMessage = (e as Error).message;
    res.status(422).json({ error: errorMessage });
    console.log(errorMessage);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  console.log("Shutting down...");
  pool.end();
  process.exit(0);
});
