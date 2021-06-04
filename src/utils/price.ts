import axios from "axios";

import { withCache } from "./cache";

export const getEgldPrice = withCache(
  10,
  async (): Promise<null | number> => {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=elrond-erd-2&vs_currencies=usd"
    );

    if (!response) {
      return null;
    }

    const price = response.data["elrond-erd-2"].usd;

    return price;
  }
);
