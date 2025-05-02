"use server";

import * as crypto from 'crypto'

export const getIntercomUserHash = async (userId: string | undefined) => {
  try {
    
    if(!userId) return undefined;

    const secretKey = process.env.INTERCOM_SECRET_KEY;
    const hash = crypto.createHmac('sha256', secretKey!).update(userId).digest('hex');

    return { success: hash };
  } catch (error) {
    return { error: "Could not fetch user intercom hash" };
  }
};
