import { NextResponse, NextRequest } from "next/server";
import { ActionPostResponse, ActionGetResponse } from "@solana/actions";
import axios from "axios";
import { headers } from "../../../utils/headers";

export async function GET() {
  return NextResponse.json({}, {
    headers: headers,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { serviceId: string } },
) {
  const res = await axios.get(`${process.env.API_URL}/services/${params.serviceId}`)
  const body = await request.json();

  if (body.signature) {
    await axios.post(`${process.env.API_URL}/services/${params.serviceId}/request-blinks`, {
      content: request.nextUrl.searchParams.get("description"),
      transactionId: request.nextUrl.searchParams.get("transactionId"),
      wallet: body.account
    })

    const response: ActionGetResponse = {
      type: "action",
      icon: res.data.images[0],
      title: res.data.title,
      description: res.data.content,
      label: "Action payment",
      links: {
        actions: [
          {
            type: 'external-link',
            href: `/api/actions/services/payment/${params.serviceId}/complete`,
            label: 'Go to Service',
          }
        ],
      },
    };


    return NextResponse.json(response, {
      headers: headers,
    });
  }

  const res1 = await axios.post(`${process.env.API_URL}/transactions/blinks`, {
    payer: body.account,
    token: {
      mintAddress: res.data.asset.mintAddress,
      amount: Number(Number(res.data.asset.amount) / Math.pow(10, res.data.asset.decimals))
    }
  })

  const response: ActionPostResponse = {
    type: "transaction",
    transaction: res1.data.serializedTransaction,
    message: "send transaction",
    links: {
      next: {
        type: 'post',
        href: `/api/actions/services/payment/${params.serviceId}?transactionId=${res1.data.transactionId}&description=${body.data.description}`,
      },
    },
  };

  return NextResponse.json(response, {
    headers: headers,
  });
}

export const OPTIONS = GET;