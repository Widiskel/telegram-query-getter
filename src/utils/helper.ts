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
}
