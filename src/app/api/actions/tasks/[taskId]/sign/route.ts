import { NextResponse } from "next/server";
import {
  ActionGetResponse,
  createSignMessageText, MEMO_PROGRAM_ID,
} from "@solana/actions";
import axios from 'axios'

import { SignMessageData, SignMessageResponse } from "@solana/actions-spec";
import { headers } from "@/app/api/actions/utils/headers";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction, TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";

export async function GET() {
  return NextResponse.json({}, {
    headers: headers,
  });
}

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
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
        href: `/api/actions/tasks/${params.taskId}/sign/verify`,
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