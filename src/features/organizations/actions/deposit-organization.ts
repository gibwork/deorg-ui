"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const depositOrganization = async (dto: {
  serializedTransaction: string;
}) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.post(
      `${process.env.API_URL}/Organizations/deposit`,
      dto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    console.error(error);
    return { error: "Could not fetch organizations" };
  }
};

export const depositOrganizationTransaction = async (dto: {
  organizationTokenAccount: string;
  tokenMint: string;
  amount: number;
}) => {
  try {
    const { getToken, orgId } = auth();
    const token = await getToken();

    const { data } = await axios.post(
      `${process.env.API_URL}/transactions/organization/deposit`,
      dto,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch organizations" };
  }
};
