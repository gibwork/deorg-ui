import { ActionsJson } from "@solana/actions";
import {NextResponse} from "next/server";
import {headers} from "@/app/api/actions/utils/headers";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/services/*",
        apiPath: "/api/actions/services/*",
      },
      {
        pathPattern: "/tasks/*",
        apiPath: "/api/actions/tasks/*",
      },
    ],
  };

  return NextResponse.json(payload, {
    headers: headers
  });
};

export const OPTIONS = GET;
