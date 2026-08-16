const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const serverDir = path.join(dist, "server");
const hostingDir = path.join(dist, ".openai");

fs.mkdirSync(serverDir, { recursive: true });
fs.mkdirSync(hostingDir, { recursive: true });
fs.copyFileSync(
  path.join(root, ".openai", "hosting.json"),
  path.join(hostingDir, "hosting.json"),
);

fs.writeFileSync(
  path.join(serverDir, "index.js"),
  `const SPA_PATHS = new Set(["/student", "/admin", "/login/student", "/login/admin"]);

export default {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response("CareerCube asset binding is unavailable.", { status: 503 });
    }

    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);
    const wantsHtml = request.method === "GET" &&
      (request.headers.get("accept") || "").includes("text/html");

    if (response.status === 404 && (wantsHtml || SPA_PATHS.has(url.pathname))) {
      url.pathname = "/index.html";
      response = await env.ASSETS.fetch(new Request(url, request));
    }

    return response;
  }
};
`,
  "utf8",
);
