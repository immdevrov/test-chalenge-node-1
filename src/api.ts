import axios from "axios";

const API_HOST = "https://api.skinport.com/v1";

interface ApiItem {
  market_hash_name: string;
  currency: string;
  suggested_price: number;
  item_page: string;
  market_page: string;
  min_price: number;
  max_price: number;
  mean_price: number;
  median_price: number;
  quantity: number;
  created_at: number;
  updated_at: number;
}

export async function getItems(
  appId: number = 730,
  currency: string = "EUR",
  tradable: boolean = false
) {
  const { data } = await axios.get(`${API_HOST}/items`, {
    params: {
      app_id: appId,
      currency,
      tradable,
    },
    headers: {
      "Accept-Encoding": "br",
    },
  });
  return data;
}

export async function composeItems(
  appId: number = 730,
  currency: string = "EUR"
) {
  const allItemsPromise = getItems(appId, currency, false) as Promise<
    ApiItem[]
  >;
  const tradableItemsPromise = getItems(appId, currency, true) as Promise<
    ApiItem[]
  >;
  const [allItems, tradableItems] = await Promise.all([
    allItemsPromise,
    tradableItemsPromise,
  ]);
  const tradableItemsMap = Object.fromEntries(
    tradableItems.map((i) => [i.market_hash_name, i])
  );

  return allItems.map((i) => ({
    hashName: i.market_hash_name,
    minPriceAll: i.min_price,
    minPriceTradable: tradableItemsMap[i.market_hash_name]?.min_price ?? null,
  }));
}
