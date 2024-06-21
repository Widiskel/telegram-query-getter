import { Api, TelegramClient } from "telegram";
import { FloodWaitError } from "telegram/errors";
import logger from "../utils/logger";
import { Entity, EntityLike } from "telegram/define";
import { Helper } from "../utils/helper";
import input from "input"; // npm i input
import { botUrlList } from "../utils/bot_url_list";

export class Core {
  client: TelegramClient;
  peer: EntityLike | Entity | any;
  bot: any;
  url: any;

  constructor(client: TelegramClient) {
    this.client = client;
  }

  async mode() {
    const mode = await input.text(
      "Connect Mode : \n1. Manual \n2. List \n\nInput your choice : "
    );

    if (mode == 1) {
      return true;
    } else if (mode == 2) {
      return false;
    } else {
      throw Error("Invalid input");
    }
  }

  async botList() {
    let botOptions = "Bot List:\n";
    botUrlList.forEach((item, index) => {
      botOptions += `${index + 1}. ${item.bot}\n`;
    });

    const bot = await input.text(`${botOptions}\nInput your choice: `);
    const chosenBot = botUrlList[parseInt(bot) - 1];

    if (chosenBot) {
      this.bot = chosenBot.bot;
      this.url = chosenBot.url;
    } else {
      throw Error("Invalid choice. Please try again.");
    }
  }

  async resolvePeer() {
    while (this.peer == undefined) {
      try {
        this.peer = await this.client.getEntity(this.bot);
        break;
      } catch (error) {
        if (error instanceof FloodWaitError) {
          const fls = error.seconds;

          logger.warn(
            `${this.client.session.serverAddress} | FloodWait ${error}`
          );
          logger.info(`${this.client.session.serverAddress} | Sleep ${fls}s`);

          await Helper.sleep((fls + 3) * 1000);
        } else {
          throw error;
        }
      }
    }
  }

  async process() {
    try {
      if (await this.mode()) {
        this.bot = await input.text("Enter bot username you want to connect ?");
        this.url = await input.text(
          "Enter bot Web apps URL you want to connect ?"
        );
      } else {
        await this.botList();
      }

      if (!this.bot && !this.url) {
        throw Error("You need to set Bot Username and Bot Web Apps URL");
      }

      const user = await this.client.getMe();
      console.log("USER INFO");
      console.log("Username : " + user.username);
      console.log("Phone    : " + user.phone);
      console.log();

      await this.resolvePeer();
      console.log("PEER INFO");
      console.log(`BOT    :  ${this.peer ? this.peer.username : "??"}`);
      console.log();
      const webView = await this.client.invoke(
        new Api.messages.RequestWebView({
          peer: this.peer,
          bot: this.peer,
          fromBotMenu: true,
          url: this.url, // Ensure the URL is fully qualified
          platform: "android",
        })
      );

      const authUrl = webView.url;
      console.log();
      console.log("WebView URL:", authUrl);
      console.log();
      console.log("TG Web App Data : " + Helper.getTelegramQuery(authUrl));
      console.log();
      await this.client.disconnect();
    } catch (error) {
      console.error("Error during process execution:", error);
      throw error;
    }
  }
}
