import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { Window } from "happy-dom";

const scenario = process.argv[2] || "public";
const startPath = scenario === "public" ? "/" : "/student";
const window = new Window({ url: `http://localhost${startPath}` });
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

vm.runInThisContext(fs.readFileSync(path.join(assetsDir, bundleName), "utf8"), {
  filename: bundleName,
});
await window.happyDOM.waitUntilComplete();

async function clickAndAssert(href, expectedPath, expectedText, label) {
  const links = [...document.querySelectorAll(`a[href="${href}"]`)];
  const link = label
    ? links.find((item) => item.textContent.replace(/\s+/g, " ").trim().includes(label))
    : links[0];
  if (!link) throw new Error(`Link ${href} was not found on ${window.location.pathname}.`);

  link.click();
  await new Promise((resolve) => setTimeout(resolve, 40));

  const text = document.getElementById("root")?.textContent?.replace(/\s+/g, " ").trim() || "";
  if (
    window.location.pathname !== expectedPath ||
    (expectedText && !text.includes(expectedText))
  ) {
    throw new Error(`Click ${href} did not render ${expectedPath} immediately.`);
  }
}

async function clickButtonAndAssert(label, expectedPath, expectedText) {
  const button = [...document.querySelectorAll("button")].find((item) =>
    item.textContent.replace(/\s+/g, " ").trim().includes(label));
  if (!button) throw new Error(`Button ${label} was not found on ${window.location.pathname}.`);

  button.dispatchEvent(new window.MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
  }));
  await new Promise((resolve) => setTimeout(resolve, 40));

  const text = document.getElementById("root")?.textContent?.replace(/\s+/g, " ").trim() || "";
  if (
    window.location.pathname !== expectedPath ||
    (expectedText && !text.includes(expectedText))
  ) {
    throw new Error(`Button ${label} did not update the view immediately.`);
  }
}

if (scenario === "public") {
  await clickAndAssert("/login/student", "/login/student", "Welcome back.");
  await clickAndAssert("/login/admin", "/login/admin", "Admin access.");
  await clickAndAssert("/login/student", "/login/student", "Welcome back.");
  await clickAndAssert("/", "/", "Career clarity, engineered", "Back home");
  await clickAndAssert("/login/student?mode=register", "/login/student", "Start your journey.");
  await clickButtonAndAssert("Google account", "/student");
} else if (scenario === "student") {
  await clickButtonAndAssert("Recommended jobs", "/student", "Your best-fit opportunities");
  await clickButtonAndAssert("Sign out", "/");
} else if (scenario === "brand") {
  await clickAndAssert("/", "/");
} else {
  throw new Error(`Unknown navigation scenario: ${scenario}`);
}

console.log(JSON.stringify({
  status: "passed",
  scenario,
  finalPath: window.location.pathname,
  finalSearch: window.location.search,
}));

await window.happyDOM.close();
