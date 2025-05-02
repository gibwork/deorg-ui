import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { headers } from "../../../utils/headers";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction, TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import {MEMO_PROGRAM_ID} from "@solana/actions";

export async function GET() {
  return NextResponse.json({}, {
    headers: headers,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } },
) {
  const link = request.nextUrl.searchParams.get("link")!;

  if(link) {
    const response = {
      type: 'external-link',
      externalLink: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${params.taskId}`,
    }

    return NextResponse.json(response, {
      headers: headers,
    });
  }

  const body = await request.json();

  const message = `User ${body.account} Task ${params.taskId}`;

  const transaction = await prepareMemoTransaction(
    new PublicKey(body.account),
    new PublicKey(body.account),
    message,
  );


  const response = {
    type: 'transaction',
    transaction: Buffer.from(transaction.serialize()).toString('base64'),
    links: {
      next: {
        type: 'post',
        href: `/api/actions/tasks/${params.taskId}/complete?link=true`,
      },
    },
  };

  return NextResponse.json(response, {
    headers: headers,
  });
}

export const OPTIONS = GET;


async function prepareMemoTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  memoData: string,
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
      data: Buffer.from(memoData, 'utf8'),
      keys: [],
    }),
  ];
  return prepareTransaction(instructions, payer);
}

async function prepareTransaction(
  instructions: TransactionInstruction[],
  payer: PublicKey,
) {
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const blockhash = await connection
    .getLatestBlockhash({ commitment: 'max' })
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  return new VersionedTransaction(messageV0);
}