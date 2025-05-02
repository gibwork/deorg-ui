import { NextRequest, NextResponse } from "next/server";

import axios from "axios";
import { headers } from "@/app/api/actions/utils/headers";

export async function GET() {
  return NextResponse.json({}, {
    headers: headers,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { serviceId: string } },
) {
  const response = {
    type: 'external-link',
    externalLink: `${process.env.NEXT_PUBLIC_APP_URL}/services/${params.serviceId}`,
  }

  return NextResponse.json(response, {
    headers: headers,
  });
}

export const OPTIONS = GET;