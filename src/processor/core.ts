import { Api, TelegramClient } from "telegram";
import { FloodWaitError } from "telegram/errors";
import logger from "../utils/logger";
import { Entity, EntityLike } from "telegram/define";
import { Helper } from "../utils/helper";
import input from "input"; // npm i input
import { botUrlList } from "../utils/bot_url_list";

export class Core {
  client: TelegramClient;
  session: string;
  peer: EntityLike | Entity | any;
  bot: any;
  url: any;

  constructor(client: TelegramClient, session: string) {
    this.client = client;
    this.session = session;
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
      console.error("Invalid choice, Please try again");
      await this.mode();
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
      console.error("Invalid choice. Please try again.");
      await this.botList();
    }
  }

  async resolvePeer() {
    logger.info(`Session ${this.session} - Resolving Peer`);
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
      logger.info(`Session ${this.session} - Processing`);
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
      logger.info(`Session ${this.session} - Connecting to Webview`);
      const webView = await this.client.invoke(
        new Api.messages.RequestWebView({
          peer: this.peer,
          bot: this.peer,
          fromBotMenu: true,
          url: this.url, // Ensure the URL is fully qualified
          platform: "android",
        })
      );
      logger.info(`Session ${this.session} - Webview Connected`);

      const authUrl = webView.url;
      const tgData = Helper.getTelegramQuery(authUrl);
      console.log();
      console.log("WebView URL:", authUrl);
      console.log();
      console.log("TG Web App Data : " + tgData);
      console.log();
      logger.info(`Session ${this.session} Data - ${tgData}`);
      logger.info(`Session ${this.session} - Complete`);
      await this.client.disconnect();
    } catch (error) {
      console.error("Error during process execution:", error);
      throw error;
    }
  }
}
