import { TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions";
import input from "input"; // npm i input
import { Config } from "./config";
import { Core } from "./processor/core";
import { Helper } from "./utils/helper";

let storeSession;
let sessionName: string;

async function onBoarding() {
  const choice = await input.text(
    "Welcome to Telegram Query Getter \nBy : Widiskel \n \nLets getting started. \n1. Create Session. \n2. Reset Sessions \n3. Get Query \n \nInput your choice :"
  );
  if (choice == 1) {
    if (Helper.getSession(sessionName)?.length != 0) {
      console.info(
        "You already have sessions created, please reset your sessions first"
      );
      await onBoarding();
    }
  } else if (choice == 2) {
    Helper.resetSession(sessionName);
    await onBoarding();
  } else if (choice == 3) {
    if (Helper.getSession(sessionName)?.length == 0) {
      console.info("You don't have any sessions, please create first");
      await onBoarding();
    }
  } else {
    throw Error("Invalid input");
  }
}

(async () => {
  try {
    sessionName = "sessions";
    await onBoarding();
    storeSession = new StoreSession(sessionName);
    const client = new TelegramClient(
      storeSession,
      Config.TELEGRAM_APP_ID,
      Config.TELEGRAM_APP_HASH,
      {
        connectionRetries: 5,
      }
    );

    await client.start({
      phoneNumber: async () =>
        await input.text("Enter your Telegram Phone Number ?"),
      password: async () => await input.text("Enter your Telegram Password?"),
      phoneCode: async () =>
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
