import { NextResponse } from "next/server";
import axios from 'axios'
import { SignMessageData, SignMessageResponse } from "@solana/actions-spec";
import { headers } from "../../../utils/headers";


export async function GET() {
  return NextResponse.json({}, {
    headers: headers,
  });
}

export async function POST(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  const body = await request.json();

  const message = `Please sign this message to verify your identity: ${body.account}`;

  const response: SignMessageResponse = {
    type: 'message',
    data: message,
    links: {
      next: {
        type: 'post',
        href: `/api/actions/services/${params.serviceId}/sign/verify`,
      },
    },
  };

  return NextResponse.json(response, {
    headers: headers,
  });
}

export const OPTIONS = GET;