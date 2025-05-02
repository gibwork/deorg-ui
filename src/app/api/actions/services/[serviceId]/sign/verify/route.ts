import bs58 from "bs58";
import { NextResponse } from "next/server";
import { ActionGetResponse } from "@solana/actions";
import axios from "axios";
import { walletSignIn } from "@/actions/post/wallet-sign-in";
import { headers } from "@/app/api/actions/utils/headers";

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

  const { error } = await walletSignIn(body.account, btoa(String.fromCharCode(...bs58.decode(body.signature))))

  if (error) {
    const res = await axios.get(`${process.env.API_URL}/services/${params.serviceId}`)

    const response = {
      type: "action",
      icon: res.data.images[0],
      title: res.data.title,
      description: res.data.content,
      error: {
        message: 'Invalid signature'
      },
      label: "Action payment",
      links: {
        actions: [
          {
            type: 'message',
            href: '/api/actions/sign',
            label: 'Next'
          }
        ],
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  }


  const res = await axios.get(`${process.env.API_URL}/services/${params.serviceId}`)

  const response: ActionGetResponse = {
    type: "action",
    icon: res.data.images[0],
    title: res.data.title,
    description: res.data.content,
    label: "Action payment",
    links: {
      actions: [
        {
          type: "post",
          label: `Pay ${Number(res.data.asset.amount) / Math.pow(10, res.data.asset.decimals)} ${res.data.asset.symbol}`,
          href: `/api/actions/services/payment/${params.serviceId}`,
          parameters: [
            {
              name: "description",
              label: "Description",
              type: 'textarea',
            }
          ]
        },
      ],
    },
  };

  return NextResponse.json(response, {
    headers: headers,
  });
}

export const OPTIONS = GET;