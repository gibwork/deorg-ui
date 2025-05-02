import { NextRequest, NextResponse } from "next/server";
import { ActionPostResponse } from "@solana/actions";
import axios from "axios";
import bs58 from "bs58";
import removeMarkdown from "remove-markdown";
import { headers } from "@/app/api/actions/utils/headers";

export async function GET() {
  return NextResponse.json(
    {},
    {
      headers: headers,
    }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const res = await axios.get(`${process.env.API_URL}/tasks/${params.taskId}`);
  const body = await request.json();

  const signature = request.nextUrl.searchParams.get("signature")!;
  const transactionId = request.nextUrl.searchParams.get("transactionId")!;
  const res1 = await axios.post(
    `${process.env.API_URL}/tasks/${params.taskId}/claim-blinks`,
    {
      transactionId,
      txHash: "txHash",
      wallet: body.account,
      signature
    }
  );

  const content = removeMarkdown(res.data.content);
  const contentText = content.replace(/\\/g, "");
  const response = {
    type: "completed",
    message: "Task claimed done",
    icon: res.data.blinksImage,
    title: res.data.title,
    description: contentText,
    label: "Claimed!",
  };

  return NextResponse.json(response, {
    headers: headers,
  });
}

export const OPTIONS = GET;
