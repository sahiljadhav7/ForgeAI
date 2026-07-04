import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const DEBUG_HOST = "http://127.0.0.1:9222";
const PAGE_URL = "https://www.forgeai.lol";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createPageTarget() {
  const response = await fetch(`${DEBUG_HOST}/json/new?about:blank`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error(`Failed to create target: ${response.status}`);
  }
  return response.json();
}

function createCdpClient(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  const events = new Map();

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.id) {
      const handler = pending.get(message.id);
      if (!handler) return;
      pending.delete(message.id);
      if (message.error) {
        handler.reject(new Error(message.error.message));
      } else {
        handler.resolve(message.result);
      }
      return;
    }

    const handlers = events.get(message.method) ?? [];
    for (const handler of handlers) handler(message.params);
  });

  async function ready() {
    if (ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
  }

  async function send(method, params = {}) {
    await ready();
    const id = nextId++;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  }

  function once(method) {
    return new Promise((resolve) => {
      const handlers = events.get(method) ?? [];
      const wrapped = (params) => {
        events.set(
          method,
          (events.get(method) ?? []).filter((handler) => handler !== wrapped),
        );
        resolve(params);
      };
      handlers.push(wrapped);
      events.set(method, handlers);
    });
  }

  async function close() {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }

  return { send, once, close };
}

async function saveBase64Png(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, Buffer.from(data, "base64"));
}

async function captureClip(client, filePath, clip) {
  const { data } = await client.send("Page.captureScreenshot", {
    format: "png",
    clip,
  });
  await saveBase64Png(filePath, data);
}

async function getBoundingClientRect(client, selector) {
  const { result } = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY,
        width: rect.width,
        height: rect.height
      };
    })()`,
    returnByValue: true,
  });

  if (!result.value) {
    throw new Error(`Selector not found: ${selector}`);
  }

  return result.value;
}

async function main() {
  const target = await createPageTarget();
  const client = await createCdpClient(target.webSocketDebuggerUrl);

  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1600,
      height: 2200,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.send("Emulation.setDefaultBackgroundColorOverride", {
      color: { r: 10, g: 10, b: 10, a: 1 },
    });

    const loadEvent = client.once("Page.loadEventFired");
    await client.send("Page.navigate", { url: PAGE_URL });
    await loadEvent;
    await wait(2500);

    await captureClip(
      client,
      "C:/Users/ADMIN/OneDrive/Desktop/AI-APP-BUILDER/public/README-hero.png",
      { x: 0, y: 0, width: 1600, height: 980, scale: 1 },
    );

    const workspaceRect = await getBoundingClientRect(
      client,
      "section.px-4.pb-32",
    );

    await captureClip(
      client,
      "C:/Users/ADMIN/OneDrive/Desktop/AI-APP-BUILDER/public/README-workspace.png",
      {
        x: 120,
        y: Math.max(workspaceRect.y - 40, 0),
        width: 1360,
        height: Math.min(workspaceRect.height + 80, 980),
        scale: 1,
      },
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
