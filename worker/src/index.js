export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);
    const redditUrl = `https://www.reddit.com${url.pathname}${url.search}`;

    const response = await fetch(redditUrl, {
      headers: {
        "User-Agent": "reddit-lite-proxy/1.0",
      },
    });

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return newResponse;
  },
};
