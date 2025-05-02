import { NextRequest, NextResponse } from "next/server";
import { ActionPostResponse } from "@solana/actions";
import axios from "axios";
import bs58 from "bs58";
import { headers } from "../../../utils/headers";

export async function GET() {
  return NextResponse.json({}, {
    headers: headers,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } },
) {
  const res = await axios.get(`${process.env.API_URL}/tasks/${params.taskId}`)
  const body = await request.json();
  const signature = request.nextUrl.searchParams.get("signature")!

  const res1 = await axios.post(`${process.env.API_URL}/transactions/blinks/task/${params.taskId}/withdraw`, {
    payer: body.account,
    signature
  })

  const response: ActionPostResponse = {
    type: "transaction",
    transaction: res1.data.serializedTransaction,
    message: "send transaction",
    links: {
      next: {
        type: 'post',
        href: `/api/actions/tasks/${params.taskId}/claim/complete?transactionId=${res1.data.transactionId}&signature=${signature}`,
      },
    },
  };

  return NextResponse.json(response, {
    headers: headers,
  });
}

export const OPTIONS = GET;