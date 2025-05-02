"use client";

import React, { useEffect, useState } from "react";
import Intercom from "@intercom/messenger-js-sdk";
import { useUser } from "@clerk/nextjs";
import { getIntercomUserHash } from "@/actions/get/get-intercom-user-hash";

export default function IntercomMessenger() {
  const { user } = useUser();
  const [userHash, setUserHash] = useState<undefined | string>();
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

  const environment = process.env.NEXT_PUBLIC_NODE_ENV;

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.id) {
        const result = await getIntercomUserHash(user?.id.toString());
        if (result && result.success) setUserHash(result.success);
      }
    };

    fetchData();
  }, [user]);

  if (environment === "LOCAL" || !appId) return null;

  if (user && userHash) {
    Intercom({
      app_id: appId,
      user_id: user?.id,
      name: user?.fullName ?? undefined,
      created_at: user?.createdAt?.getUTCMilliseconds() ?? undefined,
      user_hash: userHash,
    });
  } else if (!user) {
    Intercom({
      app_id: appId,
    });
  } else {
  }

  return <></>;
}
