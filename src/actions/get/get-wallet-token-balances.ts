"use server";

import { getDisplayDecimalAmountFromAsset } from "@/lib/utils";
import {
  TokenPriceResponse,
  TokenPricesStore,
} from "@/store/use-cached-token-prices";
import { auth } from "@clerk/nextjs/server";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";

export const getUserWalletBalance = async (network: string) => {
  try {
    const { getToken } = auth();
    const token = await getToken();
    const { data } = await axios.get(`${process.env.API_URL}/users/balance?network=${network}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch user data" };
  }
};

export const revalidateUserWalletBalance = async () => {
  try {
    const { getToken } = auth();
    const token = await getToken();
    const { data } = await axios.get(
      `${process.env.API_URL}/users/balance/revalidate`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch user data" };
  }
};

export const getPriceFromTokenMintAddress = async (mintAddress: string) => {
  // There will be exceptions, when no price is found...
  const { userId } = auth();
  if (!userId) return { error: "User not logged in" };

  try {
    const { getToken } = auth();
    const token = await getToken();
    const { data } = await axios.get(
      `${process.env.API_URL}/tokens/price/${mintAddress}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data?.price;
  } catch (error) {
    console.log((error as Error).message);
    return 0;
  }
};

export const getUserSPLTokenBalances = async (
  publicKey: string,
  network: string
) => {
  const { userId } = auth();
  if (!userId) return { error: "User not logged in" };
  try {
    const rpcUrl: string =
      network === "devnet"
        ? process.env.RPC_URL!.replace("mainnet", "devnet")
        : process.env.RPC_URL!;

    const { data } = await axios.post(rpcUrl, {
      id: 1,
      jsonrpc: "2.0",
      method: "searchAssets",
      params: {
        ownerAddress: publicKey,
        tokenType: "fungible",
        displayOptions: {
          showNativeBalance: true,
        },
      },
    });

    // There will be time when Helius does not have the price (WORK token for example)
    let splTokenBalances = data?.result?.items;
    splTokenBalances.forEach(async (element: any) => {
      //Find the token with missing price...
      if (!element?.token_info?.price_info) {
        let tokenMintAddress = element.id;
        let tokenPrice = await getPriceFromTokenMintAddress(tokenMintAddress);

        element.token_info.price_info = {
          total_price:
            getDisplayDecimalAmountFromAsset(
              element.token_info.balance,
              element.token_info.decimals
            ) * tokenPrice,
        };
      }
    });

    //Helius does not include SOL balance, must do manuall
    const solBalance = await getUserSolBalance(publicKey, network);
    const pricePerSol = await getPriceFromTokenMintAddress(
      "So11111111111111111111111111111111111111112"
    );

    const modData = splTokenBalances.map((element: any) => {
      return {
        address: element.id,
        symbol: element.content.metadata.symbol,
        name: element.content.metadata.name,
        logoURI: element.content.links.image,
        tokenInfo: element.token_info,
      };
    });

    modData.push({
      address: "So11111111111111111111111111111111111111112",
      symbol: "SOL",
      name: "Wrapped SOL",
      logoURI: "https://cdn.gib.work/token-images/solana.png",
      tokenInfo: {
        balance: solBalance,
        supply: -1,
        decimals: 9,
        token_program: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        associated_token_address: "",
        price_info: {
          price_per_token: pricePerSol,
          total_price: (solBalance / LAMPORTS_PER_SOL) * pricePerSol,
          currency: "SOL",
        },
      },
    });

    return { success: modData.reverse() };
  } catch (error) {
    return { error: "Could not fetch tasks" };
  }
};

export const getUserSolBalance = async (publicKey: string, network: string) => {
  const { userId } = auth();

  if (!userId) return { error: "User not logged in" };

  const rpcUrl: string =
    network === "devnet"
      ? process.env.RPC_URL!.replace("mainnet", "devnet")
      : process.env.RPC_URL!;

  const { data } = await axios.post(rpcUrl, {
    id: 1,
    jsonrpc: "2.0",
    method: "getBalance",
    params: [publicKey],
  });

  return data.result.value;
};

export const getMultipleTokenPricesFromMintAddress = async (
  addresses: string[]
) => {
  // There will be exceptions, when no price is found...
  const { userId } = auth();

  if (!userId) return { error: "User not logged in" };
  try {
    const { data } = await axios.get(
      `https://price.jup.ag/v6/price?ids=${addresses.join(",")}`
    );

    const newPrices = await transformAPIToStoredFormat(data.data);

    return { success: newPrices };
  } catch (error) {
    console.log((error as Error).message);
    return { error: (error as Error).message };
  }
};

export const transformAPIToStoredFormat = async (
  apiResponse: Record<string, TokenPriceResponse>
): Promise<TokenPricesStore> => {
  const transformed: TokenPricesStore = {};

  await Object.entries(apiResponse).forEach(([mintAddress, data]) => {
    transformed[mintAddress] = {
      price: data.price,
      timestamp: Date.now(),
    };
  });

  return transformed;
};
