"use server";

import axios, { AxiosError } from "axios";
import { auth } from "@clerk/nextjs/server";
import { ErrorResponse } from "@/types/types.error";

export const createContributorProposal = async ({organizationId,   transactionId, serializedTransaction}: {organizationId: string, transactionId: string, serializedTransaction: string}) => {
    try {
        const { getToken, orgId } = auth();
        const token = await getToken();

        const { data } = await axios.post(
            `${process.env.API_URL}/organizations/${organizationId}/proposals/contributor`,
            { transactionId, serializedTransaction },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return { success: data };
    } catch (error) {
        const data = (error as AxiosError).response?.data as ErrorResponse;
        return { error: data };
    }
};
