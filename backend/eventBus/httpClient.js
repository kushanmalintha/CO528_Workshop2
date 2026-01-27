const http = require("http");
const https = require("https");

const postJson = (url, payload, timeoutMs = 3000) => {
  const parsedUrl = new URL(url);
  const body = JSON.stringify(payload);
  const isHttps = parsedUrl.protocol === "https:";
  const client = isHttps ? https : http;

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (isHttps ? 443 : 80),
    path: parsedUrl.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    },
    timeout: timeoutMs
  };

  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      res.resume();
      res.on("end", () => resolve({ statusCode: res.statusCode }));
    });

    req.on("timeout", () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

module.exports = { postJson };
