import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { Window } from "happy-dom";

const targetPath = process.argv[2] || "/";
const window = new Window({ url: `http://localhost${targetPath}` });
const protectedRole = targetPath === "/admin" ? "admin" : targetPath === "/student" ? "student" : null;
if (protectedRole) {
  window.localStorage.setItem("careerforge_token", "runtime-test-token");
  window.localStorage.setItem("careerforge_session", JSON.stringify({
    role: protectedRole,
    name: protectedRole === "admin" ? "Private Administrator" : "Test Student",
    email: `${protectedRole}@example.com`,
  }));
}

const browserGlobals = {
  window,
  self: window,
  document: window.document,
  navigator: window.navigator,
  location: window.location,
  history: window.history,
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
  MouseEvent: window.MouseEvent,
  HTMLElement: window.HTMLElement,
  HTMLAnchorElement: window.HTMLAnchorElement,
  Element: window.Element,
  Node: window.Node,
  Text: window.Text,
  MutationObserver: window.MutationObserver,
  getComputedStyle: window.getComputedStyle.bind(window),
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
};

for (const [key, value] of Object.entries(browserGlobals)) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
}

document.body.innerHTML = '<div id="root"></div>';

const assetsDir = path.resolve("dist", "client", "assets");
const bundleName = fs.readdirSync(assetsDir).find((file) => /^index-.*\.js$/.test(file));
if (!bundleName) throw new Error("Production JavaScript bundle was not found.");

const code = fs.readFileSync(path.join(assetsDir, bundleName), "utf8");
vm.runInThisContext(code, { filename: bundleName });
await window.happyDOM.waitUntilComplete();
await new Promise((resolve) => setTimeout(resolve, 50));

const root = document.getElementById("root");
let text = root?.textContent?.replace(/\s+/g, " ").trim() || "";
if (!root || root.children.length === 0 || text.length < 20) {
  throw new Error(`Route ${targetPath} did not render meaningful content.`);
}

if (targetPath === "/") {
  const expectedPublicLinks = ["/community", "/resources", "/login/student"];
  for (const href of expectedPublicLinks) {
    if (!document.querySelector(`footer a[href="${href}"]`)) {
      throw new Error(`Landing footer link ${href} is missing.`);
    }
  }
}

console.log(JSON.stringify({
  route: targetPath,
  childElements: root.children.length,
  textPreview: text.slice(0, 120),
}));

await window.happyDOM.close();
