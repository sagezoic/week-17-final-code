import express from "express";
import db from "@repo/db/client";
const app = express();

app.use(express.json());

app.post("/hdfcWebhook", async (req, res) => {
  //TODO: Add zod validation here?
  //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
  //TODO: Add checks to ensure the transaction is not already processed

  const paymentInformation: {
    token: string;
    userId: string;
    amount: string;
  } = {
    token: req.body.token,
    userId: req.body.user_identifier,
    amount: req.body.amount,
  };

  try {
    await db.$transaction([
      db.balance.upsert({
        where: { userId: Number(paymentInformation.userId) },
        update: {
          amount: {
            increment: Number(paymentInformation.amount),
          },
        },
        create: {
          userId: Number(paymentInformation.userId),
          amount: Number(paymentInformation.amount),
          locked: 0, // Add the 'locked' property with a default value
        },
      }),
      db.onRampTransaction.updateMany({
        where: {
          token: paymentInformation.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    res.json({
      message: "Captured",
    });
  } catch (e) {
    console.error(e);
    res.status(411).json({
      message: "Error while processing webhook",
    });
  }
});

app.listen(3003);
