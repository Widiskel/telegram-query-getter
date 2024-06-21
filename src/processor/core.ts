import { Api, TelegramClient } from "telegram";
import { FloodWaitError } from "telegram/errors";
import logger from "../utils/logger";
import { Entity, EntityLike } from "telegram/define";
import { Helper } from "../utils/helper";
import input from "input"; // npm i input

export class Core {
  client: TelegramClient;
  peer: EntityLike | Entity | undefined;
  bot: any;
  url: any;

  constructor(client: TelegramClient) {
    this.client = client;
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
      this.bot = async () =>
        await input.text("Enter bot username you want to connect ?");
      this.url = async () =>
        await input.text("Enter bot Web apps URL you want to connect ?");

      if (!this.bot && !this.url) {
        throw Error("You need to set Bot Username and Bot Web Apps URL");
      }

      const user = await this.client.getMe();
      console.log("User:", user);

      await this.resolvePeer();
      console.log("Resolved Peer:", this.peer);

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
      console.log("WebView URL:", authUrl);
      console.log("TG Web App Data : " + Helper.getTelegramQuery(authUrl));
    } catch (error) {
      console.error("Error during process execution:", error);
      throw error;
    }
  }
}
