import bs58 from "bs58";
import { NextResponse } from "next/server";
import { ActionGetResponse } from "@solana/actions";
import axios from "axios";
import { walletSignIn } from "@/actions/post/wallet-sign-in";
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
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const body = await request.json();

  const { error } = await walletSignIn(
    body.account,
    body.signature,
    true
  );

  if (error) {
    const res = await axios.get(
      `${process.env.API_URL}/tasks/${params.taskId}`
    );

    const content = removeMarkdown(res.data.content);
    const contentText = content.replace(/\\/g, "");
    const response = {
      type: "action",
      icon: res.data.blinksImage,
      title: res.data.title,
      description: contentText,
      error: {
        message: "Invalid signature",
      },
      label: "Action payment",
      links: {
        actions: [
          {
            type: "message",
            href: `/api/actions/tasks/${params.taskId}/sign`,
            label: res.data.isOpen ? "Connect Wallet" : "Task Completed",
          },
        ],
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  }

  const res = await axios.get(`${process.env.API_URL}/tasks/${params.taskId}`);

  const owner = res.data.user.walletAddress === body.account;

  const content = removeMarkdown(res.data.content);
  const contentText = content.replace(/\\/g, "");
  if (owner) {
    const response: ActionGetResponse = {
      type: "action",
      icon: res.data.blinksImage,
      title: res.data.title,
      description: contentText,
      label: "Action payment",
      disabled: true,
      links: {
        actions: [
          {
            href: `/api/actions/tasks/${params.taskId}/complete`,
            label: "Go to app",
            type: "external-link",
          },
        ],
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  }

  const submission = res.data.taskSubmissions.find(
    (submission: any) => submission.user.walletAddress === body.account
  );

  if (!submission) {
    let actions: any = [
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
    ]

    if (!res.data.isOpen) {
      actions = [
        {
          type: "message",
          href: `/api/actions/tasks/${params.taskId}/sign`,
          label: res.data.isOpen ? "Connect Wallet" : "Task Completed",
        },
      ]
    }

    const response: ActionGetResponse = {
      type: "action",
      icon: res.data.blinksImage,
      title: res.data.title,
      description: contentText,
      disabled: res.data.isOpen ? false : true,
      label: "Action payment",
      links: {
        actions
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  }

  if (submission.status === "OPEN") {
    const response: ActionGetResponse = {
      type: "action",
      icon: res.data.blinksImage,
      title: res.data.title,
      description: contentText,
      label: "Action payment",
      disabled: true,
      links: {
        actions: [
          {
            type: "post",
            label: "Submission pending",
            href: "",
          },
        ],
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  }

  if (submission.status === "WAITING_CLAIM") {
    const response: ActionGetResponse = {
      type: "action",
      icon: res.data.blinksImage,
      title: res.data.title,
      description: contentText,
      label: "Action payment",
      links: {
        actions: [
          {
            type: "post",
            label: `Claim ${Number(submission.asset.amount) /
              Math.pow(10, submission.asset.decimals)
              } ${submission.asset.symbol}`,
            href: `/api/actions/tasks/${params.taskId}/claim?signature=${body.signature}`,
          },
        ],
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  }

  if (submission.status === "CLAIMED") {
    let actions: any = [
      {
        type: "post",
        label: "Submission Claimed",
        href: "",
      },
    ];

    if (!res.data.isOpen) {
      actions = [
        {
          type: "message",
          href: `/api/actions/tasks/${params.taskId}/sign`,
          label: res.data.isOpen ? "Connect Wallet" : "Task Completed",
        },
      ]
    }

    const response: ActionGetResponse = {
      type: "action",
      icon: res.data.blinksImage,
      title: res.data.title,
      description: contentText,
      label: "Action payment",
      disabled: true,
      links: {
        actions
      },
    };

    return NextResponse.json(response, {
      headers: headers,
    });
  }

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
          label: res.data.isOpen ? "Connect Wallet" : "Task Completed",
        },
      ],
    },
  };

  return NextResponse.json(response, {
    headers: headers,
  });
}

export const OPTIONS = GET;

