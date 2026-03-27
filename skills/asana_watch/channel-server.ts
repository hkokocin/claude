import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { spawn, type Subprocess } from "bun";
import { createHmac } from "node:crypto";

const PORT = Number(process.env.ASANA_WEBHOOK_PORT) || 8788;
const ASANA_PAT = process.env.ASANA_PAT;
const ASANA_PROJECT_GID = process.env.ASANA_PROJECT_GID;
const ASANA_USER_GID = process.env.ASANA_USER_GID;
const ASANA_BASE = "https://app.asana.com/api/1.0";

if (!ASANA_PAT) {
  console.error("FATAL: ASANA_PAT is required");
  process.exit(1);
}
if (!ASANA_PROJECT_GID) {
  console.error("FATAL: ASANA_PROJECT_GID is required");
  process.exit(1);
}

let hookSecret: string | null = null;
let webhookGid: string | null = null;
let tunnelUrl: string | null = null;
let cloudflaredProc: Subprocess | null = null;
let shuttingDown = false;

const debounceMap = new Map<string, number>();
const DEBOUNCE_MS = 2000;

function log(msg: string) {
  console.error(`[asana-webhook] ${msg}`);
}

async function asanaFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${ASANA_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${ASANA_PAT}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") || "5");
    log(`Rate limited, retrying after ${retryAfter}s`);
    await Bun.sleep(retryAfter * 1000);
    return asanaFetch(path, options);
  }
  return res;
}

async function getTaskDetails(taskGid: string) {
  const fields =
    "name,assignee,assignee.name,memberships.section,memberships.section.name,completed,notes,permalink_url";
  const res = await asanaFetch(`/tasks/${taskGid}?opt_fields=${fields}`);
  if (!res.ok) {
    log(`Failed to fetch task ${taskGid}: ${res.status}`);
    return null;
  }
  const json = await res.json();
  return json.data;
}

function getSectionName(task: any): string {
  if (!task.memberships || task.memberships.length === 0) return "unknown";
  for (const m of task.memberships) {
    if (m.section?.name) return m.section.name;
  }
  return "unknown";
}

function formatEvent(event: any, task: any): string {
  const section = getSectionName(task);
  const assignee = task.assignee?.name || "unassigned";
  const notes = task.notes
    ? task.notes.substring(0, 300) + (task.notes.length > 300 ? "..." : "")
    : "(no description)";
  return [
    `Task: ${task.name}`,
    `Action: ${event.action}`,
    `Section: ${section}`,
    `Assignee: ${assignee}`,
    `Completed: ${task.completed}`,
    `URL: ${task.permalink_url}`,
    `Description: ${notes}`,
  ].join("\n");
}

function verifySignature(body: string, signature: string): boolean {
  if (!hookSecret) return false;
  const computed = createHmac("sha256", hookSecret).update(body).digest("hex");
  return computed === signature;
}

function shouldDebounce(taskGid: string): boolean {
  const now = Date.now();
  const last = debounceMap.get(taskGid);
  if (last && now - last < DEBOUNCE_MS) return true;
  debounceMap.set(taskGid, now);
  return false;
}

// --- MCP Server ---

const mcp = new Server(
  { name: "asana-webhook", version: "0.1.0" },
  {
    capabilities: { experimental: { "claude/channel": {} } },
    instructions: [
      'Asana project events arrive as <channel source="asana-webhook" ...> tags.',
      "Each event includes attributes: event_type, task_gid, task_name, section, assignee, completed.",
      "Read ~/.claude/skills/asana_watch/SKILL.md for the playbook that maps events to actions.",
      "Use the Asana MCP tools (asana_get_task, asana_create_task_story, asana_update_task) to interact with Asana.",
      "This is a one-way channel: act on events, do not reply through the channel.",
    ].join(" "),
  }
);

// --- HTTP Server ---

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json({
        status: "ok",
        tunnel: tunnelUrl,
        webhook: webhookGid,
      });
    }

    if (req.method === "POST" && url.pathname === "/asana-webhook") {
      const secret = req.headers.get("x-hook-secret");
      if (secret) {
        hookSecret = secret;
        log("Handshake received, stored hook secret");
        return new Response(null, {
          status: 200,
          headers: { "x-hook-secret": secret },
        });
      }

      const body = await req.text();

      const signature = req.headers.get("x-hook-signature");
      if (signature && !verifySignature(body, signature)) {
        log("Invalid signature, rejecting");
        return new Response("Invalid signature", { status: 400 });
      }

      const payload = JSON.parse(body);
      const events = payload.events || [];

      if (events.length === 0) {
        return new Response(null, { status: 200 });
      }

      for (const event of events) {
        if (!event.resource?.gid) continue;
        if (event.resource.resource_type !== "task") continue;
        if (shouldDebounce(event.resource.gid)) {
          log(`Debounced event for task ${event.resource.gid}`);
          continue;
        }

        const task = await getTaskDetails(event.resource.gid);
        if (!task) continue;

        if (ASANA_USER_GID && task.assignee?.gid !== ASANA_USER_GID) {
          continue;
        }

        const section = getSectionName(task);
        const content = formatEvent(event, task);
        log(`Event: ${event.action} on "${task.name}" in "${section}"`);

        await mcp.notification({
          method: "notifications/claude/channel",
          params: {
            content,
            meta: {
              event_type: event.action,
              task_gid: event.resource.gid,
              task_name: task.name,
              section,
              assignee: task.assignee?.name || "unassigned",
              completed: String(task.completed),
            },
          },
        });
      }

      return new Response(null, { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
});

log(`HTTP server listening on port ${PORT}`);

// --- Tunnel ---

async function startTunnel(): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(["cloudflared", "tunnel", "--url", `http://localhost:${PORT}`], {
      stdout: "ignore",
      stderr: "pipe",
    });
    cloudflaredProc = proc;

    const timeout = setTimeout(() => {
      reject(new Error("Tunnel startup timed out after 15s"));
    }, 15000);

    const reader = proc.stderr.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          console.error(`[cloudflared] ${line}`);
          const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
          if (match) {
            clearTimeout(timeout);
            resolve(match[0]);
            return;
          }
        }
      }
    })();
  });
}

// --- Webhook Lifecycle ---

async function getWorkspaceGid(): Promise<string> {
  const res = await asanaFetch(
    `/projects/${ASANA_PROJECT_GID}?opt_fields=workspace,workspace.gid`
  );
  const json = await res.json();
  return json.data.workspace.gid;
}

async function cleanupStaleWebhooks(workspaceGid: string) {
  const res = await asanaFetch(
    `/webhooks?workspace=${workspaceGid}&resource=${ASANA_PROJECT_GID}`
  );
  if (!res.ok) {
    log(`Failed to list webhooks: ${res.status}`);
    return;
  }
  const json = await res.json();
  for (const wh of json.data || []) {
    if (wh.target?.includes("trycloudflare.com")) {
      log(`Deleting stale webhook ${wh.gid} -> ${wh.target}`);
      await asanaFetch(`/webhooks/${wh.gid}`, { method: "DELETE" });
    }
  }
}

async function registerWebhook(publicUrl: string): Promise<string> {
  const target = `${publicUrl}/asana-webhook`;
  log(`Registering webhook -> ${target}`);
  const res = await asanaFetch("/webhooks", {
    method: "POST",
    body: JSON.stringify({
      data: {
        resource: ASANA_PROJECT_GID,
        target,
        filters: [
          {
            resource_type: "task",
            action: "changed",
            fields: ["assignee", "memberships", "completed"],
          },
          {
            resource_type: "task",
            action: "added",
          },
        ],
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook registration failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return json.data.gid;
}

async function deleteWebhook() {
  if (!webhookGid) return;
  log(`Deleting webhook ${webhookGid}`);
  try {
    await asanaFetch(`/webhooks/${webhookGid}`, { method: "DELETE" });
  } catch (e) {
    log(`Failed to delete webhook: ${e}`);
  }
}

// --- Cleanup ---

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  log("Shutting down...");
  await deleteWebhook();
  if (cloudflaredProc) {
    cloudflaredProc.kill();
    log("Killed cloudflared");
  }
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// --- Main ---

async function main() {
  await mcp.connect(new StdioServerTransport());
  log("MCP connected");

  tunnelUrl = await startTunnel();
  log(`Tunnel ready: ${tunnelUrl}`);

  const workspaceGid = await getWorkspaceGid();
  await cleanupStaleWebhooks(workspaceGid);

  webhookGid = await registerWebhook(tunnelUrl);
  log(`Webhook registered: ${webhookGid}`);
  log(`Watching project ${ASANA_PROJECT_GID} via ${tunnelUrl}`);
}

main().catch((err) => {
  log(`FATAL: ${err}`);
  process.exit(1);
});
