import express from "express";
import { createClient } from "redis";
import { composeItems } from "./api";
import { pool, init as databaseInit } from "./database";

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  console.log("Shutting down...");
  pool.end();
  process.exit(0);
});
