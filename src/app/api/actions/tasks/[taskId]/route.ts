import { NextRequest, NextResponse } from "next/server";
import { ActionGetResponse, MEMO_PROGRAM_ID } from "@solana/actions";
import axios from "axios";
import bs58 from "bs58";
import removeMarkdown from "remove-markdown";
import { headers } from "@/app/api/actions/utils/headers";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const res = await axios.get(`${process.env.API_URL}/tasks/${params.taskId}`);

  const isBlinksEnabled = res?.data?.isBlinksEnabled;

  if (!isBlinksEnabled) return NextResponse.json(null);

  const content = removeMarkdown(res.data.content);
  const contentText = content.replace(/\\/g, "");
  const response: ActionGetResponse = {
    type: "action",
    icon: res.data.blinksImage,
    title: res.data.title,
    description: contentText,
    label: "Action payment",
    links: {
      actions: [
        {
          type: "message",
          href: `/api/actions/tasks/${params.taskId}/sign`,
          label: "Connect Wallet",
        },
      ],
    },
  };

  return NextResponse.json(response, {
    headers: headers,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const body = await request.json();
  let task;
  try {
    console.log(
      `Submission task ${params.taskId} with body: ${JSON.stringify(body)}`
    );

    const res = await axios.get(
      `${process.env.API_URL}/tasks/${params.taskId}`
    );
    task = res.data;
    const signature = request.nextUrl.searchParams.get("signature")!;

    const content = removeMarkdown(res.data.content);
    const contentText = content.replace(/\\/g, "");

    const message = `User ${body.account} Task ${params.taskId}`;

    const transaction = await prepareMemoTransaction(
      new PublicKey(body.account),
      new PublicKey(body.account),
      message
    );

    await axios.post(
      `${process.env.API_URL}/tasks/${params.taskId}/submision-blinks`,
      {
        content: body.data.content,
        wallet: body.account,
        signature,
      }
    );

    const response = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
      message: "Work submitted",
      links: {
        actions: [
          {
            href: `/api/actions/tasks/${params.taskId}/complete`,
            label: "Go to Task",
            type: "external-link",
          },
        ],
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  } catch (error: any) {
    console.error(error.message);
    console.log(error?.response?.data);

    const response: ActionGetResponse = {
      type: "action",
      icon: task.data.blinksImage,
      title: task.data.title,
      description: task.data.content,
      disabled: task.data.isOpen ? false : true,
      label: "Action payment",
      error: { message: "Error to submit task, ty again" },
      links: {
        actions: [
          {
            type: "post",
            label: "Submit",
            href: `/api/actions/tasks/${params.taskId}?signature=${body.signature}`,
            parameters: [
              {
                name: "content",
                label: "Content",
                type: "textarea",
              },
            ],
          },
        ],
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  }
}

export const OPTIONS = GET;

async function prepareMemoTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  memoData: string
): Promise<VersionedTransaction> {
  const payer = new PublicKey(sender);
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports: 1,
    }),
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from(memoData, "utf8"),
      keys: [],
    }),
  ];
  return prepareTransaction(instructions, payer);
}

async function prepareTransaction(
  instructions: TransactionInstruction[],
  payer: PublicKey
) {
  const connection = new Connection(clusterApiUrl("mainnet-beta"));
  const blockhash = await connection
    .getLatestBlockhash({ commitment: "max" })
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  return new VersionedTransaction(messageV0);
}
