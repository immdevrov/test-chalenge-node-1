import express from "express";
import { Pool } from "pg";
import { createClient } from "redis";
import { composeItems } from "./api";

const app = express();
const port = 3000;

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

const redis = createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`,
});

redis.connect().catch(console.error);

app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");

    await redis.set("test", "Hello from Redis!");
    const redisValue = await redis.get("test");

    res.json({
      message: "Hello World111!",
      postgresql: "Connected successfully",
      redis: redisValue,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/items", async (req, res) => {
  try {
    const { app_id: a, currency: c } = req.query;
    console.log(a);
    console.log(c);
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
