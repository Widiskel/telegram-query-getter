import fs from "fs";
import path from "path";

export class Helper {
  static sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  static getTelegramQuery(url: string) {
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) {
      throw new Error("No query string found in the URL.");
    }

    const queryString = url.substring(hashIndex + 1);
    const decodedQueryString = queryString.split("&");
    const param = decodedQueryString[0]
      .split("&")[0]
      .replace("tgWebAppData=", "");

    if (!param) {
      throw new Error("Param not found in the query string.");
    }

    return param;
  }

  static getSession() {
    try {
      const files = fs.readdirSync(path.resolve("sessions"));
      const session: string[] = [];
      files.forEach((file) => {
        session.push(file);
      });
      return session;
    } catch (error) {
      throw Error(`Error reading sessions directory: ${error},`);
    }
  }

  static resetSession() {
    try {
      const files = fs.readdirSync(path.resolve("sessions"));
      console.log("Deleting Sessions...");
      files.forEach((file) => {
        fs.unlinkSync(path.join(path.resolve("sessions"), file));
      });
      console.info("Sessions reset successfully");
    } catch (error) {
      throw Error(`Error deleting session files: ${error},`);
    }
  }
}
