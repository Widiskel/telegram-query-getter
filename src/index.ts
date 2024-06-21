import { TelegramClient } from "telegram";
import { StoreSession, StringSession } from "telegram/sessions";
import dotenv from "dotenv";
import input from "input"; // npm i input
import { Config } from "./config";
import { Core } from "./processor/core";

dotenv.config();

const storeSession = new StoreSession("sessions");

(async () => {
  try {
    const client = new TelegramClient(
      storeSession,
      Config.TELEGRAM_APP_ID,
      Config.TELEGRAM_APP_HASH,
      {
        connectionRetries: 5,
      }
    );

    console.log(client);

    await client.start({
      phoneNumber: async () =>
        await input.text("Enter your Telegram Phone Number ?"),
      password: async () => await input.text("Enter your Telegram Password?"),
      phoneCode: async (tr) =>
        await input.text("Enter your Telegram Verification Code ?"),
      onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    storeSession.save();

    new Core(client).process();
  } catch (error) {
    console.log(error);
  }
})();
