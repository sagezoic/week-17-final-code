// You should have this on every action you create,
//if you don't write this nextJS will try to execute this code on front end rather than backend
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function createOnRampTransaction(
  amount: number,
  provider: string
) {
  const session = await getServerSession(authOptions);
  // this comes from the bank server when you tell bank someone is going to come to your site after clicking the checkout/ add money button
  // this will tell bank api you are the one app was talking about
  const token = Math.random().toString(36).substring(7);
  const userId = session.user.id;

  if (!userId) {
    return {
      message: "User not logged in",
    };
  }

  await prisma.onRampTransaction.create({
    data: {
      userId: Number(userId),
      amount: amount,
      status: "Processing",
      startTime: new Date(),
      provider,
      token,
    },
  });
}
