import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { spawn, type Subprocess } from "bun";
import { createHmac, randomBytes } from "node:crypto";

// --- Configuration ---

const PORT = Number(process.env.ASANA_WEBHOOK_PORT) || 8788;
const ASANA_PAT = process.env.ASANA_PAT;
const ASANA_BASE = "https://app.asana.com/api/1.0";
const GITHUB_WATCH_REPOS =
  process.env.GITHUB_WATCH_REPOS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) || [];
const GITHUB_EVENTS = [
  "issues",
  "pull_request",
  "issue_comment",
  "pull_request_review",
  "pull_request_review_comment",
];

if (!ASANA_PAT) {
  console.error("FATAL: ASANA_PAT is required");
  process.exit(1);
}

// --- State ---

let hookSecret: string | null = null;
let webhookGid: string | null = null;
let tunnelUrl: string | null = null;
let cloudflaredProc: Subprocess | null = null;
let shuttingDown = false;

const githubWebhookSecret = randomBytes(32).toString("hex");
const githubHookIds = new Map<string, number>();

interface PendingBatch {
  events: any[];
  timer: ReturnType<typeof setTimeout>;
}
const pendingMap = new Map<string, PendingBatch>();
const DEBOUNCE_MS = 2000;

function log(msg: string) {
  console.error(`[webhook-channel] ${msg}`);
}

// --- Asana API ---

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

async function getStoryDetails(storyGid: string) {
  const fields =
    "gid,text,type,resource_subtype,created_by,created_by.name,target,target.gid";
  const res = await asanaFetch(`/stories/${storyGid}?opt_fields=${fields}`);
  if (!res.ok) {
    log(`Failed to fetch story ${storyGid}: ${res.status}`);
    return null;
  }
  const json = await res.json();
  return json.data;
}

function verifyAsanaSignature(body: string, signature: string): boolean {
  if (!hookSecret) return false;
  const computed = createHmac("sha256", hookSecret).update(body).digest("hex");
  return computed === signature;
}

// --- GitHub API via gh CLI ---

async function ghApi(
  endpoint: string,
  options?: { method?: string; body?: any }
): Promise<any> {
  const args = ["api", endpoint];
  if (options?.method) args.push("--method", options.method);
  if (options?.body) args.push("--input", "-");

  const proc = spawn(["gh", ...args], {
    stdin: options?.body
      ? new Blob([JSON.stringify(options.body)])
      : "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`gh api ${endpoint} failed (exit ${exitCode}): ${stderr}`);
  }

  return stdout.trim() ? JSON.parse(stdout) : null;
}

function verifyGitHubSignature(body: string, signature: string): boolean {
  const expected =
    "sha256=" +
    createHmac("sha256", githubWebhookSecret).update(body).digest("hex");
  return expected === signature;
}

// --- Debouncing ---

function accumulateEvent(
  key: string,
  event: any,
  flush: (events: any[]) => void
) {
  const pending = pendingMap.get(key);
  if (pending) {
    pending.events.push(event);
    clearTimeout(pending.timer);
    pending.timer = setTimeout(() => {
      pendingMap.delete(key);
      flush(pending.events);
    }, DEBOUNCE_MS);
  } else {
    const entry: PendingBatch = {
      events: [event],
      timer: setTimeout(() => {
        pendingMap.delete(key);
        flush(entry.events);
      }, DEBOUNCE_MS),
    };
    pendingMap.set(key, entry);
  }
}

// --- MCP Server ---

const mcp = new Server(
  { name: "webhook-channel", version: "0.2.0" },
  {
    capabilities: { experimental: { "claude/channel": {} } },
    instructions: [
      'Events arrive as <channel source="webhook-channel" ...> tags.',
      'Asana events have meta source="asana". GitHub events have meta source="github".',
      "Asana meta: event_type, task_gid, task_name, section, assignee, completed.",
      "GitHub meta: event_type (e.g. pull_request.opened), repo, sender, plus issue_number/pr_number when applicable.",
      "Read ~/.claude/skills/asana_watch/SKILL.md for the playbook that maps events to actions.",
      "Use the Asana MCP tools for Asana interactions, and gh CLI for GitHub interactions.",
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
        asanaWebhook: webhookGid,
        githubWebhooks: Object.fromEntries(githubHookIds),
      });
    }

    // --- Asana webhook endpoint ---
    if (req.method === "POST" && url.pathname === "/asana-webhook") {
      const secret = req.headers.get("x-hook-secret");
      if (secret) {
        hookSecret = secret;
        log("Asana handshake received, stored hook secret");
        return new Response(null, {
          status: 200,
          headers: { "x-hook-secret": secret },
        });
      }

      const body = await req.text();
      const signature = req.headers.get("x-hook-signature");
      if (signature && !verifyAsanaSignature(body, signature)) {
        log("Invalid Asana signature, rejecting");
        return new Response("Invalid signature", { status: 400 });
      }

      const payload = JSON.parse(body);
      const events = payload.events || [];

      if (events.length === 0) {
        return new Response(null, { status: 200 });
      }

      for (const event of events) {
        if (!event.resource?.gid) continue;
        const resourceType = event.resource.resource_type;

        if (resourceType === "story") {
          accumulateEvent(
            `story:${event.resource.gid}`,
            event,
            async (batchedEvents) => {
              const story = await getStoryDetails(
                batchedEvents[0].resource.gid
              );
              if (!story) return;
              if (story.resource_subtype !== "comment_added") return;

              const taskGid =
                story.target?.gid || batchedEvents[0].parent?.gid;
              if (!taskGid) return;

              const task = await getTaskDetails(taskGid);
              if (!task) return;
              if (userGid && task.assignee?.gid !== userGid) return;

              const section = getSectionName(task);
              log(
                `Story: comment on "${task.name}" by ${story.created_by?.name}`
              );

              await mcp.notification({
                method: "notifications/claude/channel",
                params: {
                  content: JSON.stringify(
                    { events: batchedEvents, story, task },
                    null,
                    2
                  ),
                  meta: {
                    source: "asana",
                    event_type: `comment_${batchedEvents[0].action}`,
                    task_gid: taskGid,
                    task_name: task.name,
                    section,
                    assignee: task.assignee?.name || "unassigned",
                    completed: String(task.completed),
                  },
                },
              });
            }
          );
          continue;
        }

        if (resourceType !== "task") continue;

        accumulateEvent(
          `task:${event.resource.gid}`,
          event,
          async (batchedEvents) => {
            const taskGid = batchedEvents[0].resource.gid;
            const task = await getTaskDetails(taskGid);
            if (!task) return;
            if (userGid && task.assignee?.gid !== userGid) return;

            const section = getSectionName(task);
            const actions = [
              ...new Set(batchedEvents.map((e: any) => e.action)),
            ];
            const changedFields = batchedEvents
              .map((e: any) => e.change?.field)
              .filter(Boolean);

            log(
              `Events: [${actions}] on "${task.name}" in "${section}" (fields: ${changedFields.join(", ") || "n/a"})`
            );

            await mcp.notification({
              method: "notifications/claude/channel",
              params: {
                content: JSON.stringify(
                  { events: batchedEvents, task },
                  null,
                  2
                ),
                meta: {
                  source: "asana",
                  event_type: actions.join(","),
                  task_gid: taskGid,
                  task_name: task.name,
                  section,
                  assignee: task.assignee?.name || "unassigned",
                  completed: String(task.completed),
                },
              },
            });
          }
        );
      }

      return new Response(null, { status: 200 });
    }

    // --- GitHub webhook endpoint ---
    if (req.method === "POST" && url.pathname === "/github-webhook") {
      const eventType = req.headers.get("x-github-event");
      if (!eventType) {
        return new Response("Missing event type", { status: 400 });
      }

      if (eventType === "ping") {
        log("GitHub ping received");
        return new Response("pong", { status: 200 });
      }

      const body = await req.text();
      const signature = req.headers.get("x-hub-signature-256");
      if (signature && !verifyGitHubSignature(body, signature)) {
        log("Invalid GitHub signature, rejecting");
        return new Response("Invalid signature", { status: 400 });
      }

      const payload = JSON.parse(body);
      const action = payload.action || "";
      const repo = payload.repository?.full_name || "unknown";
      const sender = payload.sender?.login || "unknown";

      log(`GitHub: ${eventType}.${action} on ${repo} by ${sender}`);

      const meta: Record<string, string> = {
        source: "github",
        event_type: action ? `${eventType}.${action}` : eventType,
        repo,
        sender,
      };

      if (payload.issue) {
        meta.issue_number = String(payload.issue.number);
        meta.issue_title = payload.issue.title;
      }
      if (payload.pull_request) {
        meta.pr_number = String(payload.pull_request.number);
        meta.pr_title = payload.pull_request.title;
      }

      await mcp.notification({
        method: "notifications/claude/channel",
        params: {
          content: JSON.stringify(payload, null, 2),
          meta,
        },
      });

      return new Response(null, { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  },
});

log(`HTTP server listening on port ${PORT}`);

// --- Tunnel ---

async function startTunnel(): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      ["cloudflared", "tunnel", "--url", `http://localhost:${PORT}`],
      {
        stdout: "ignore",
        stderr: "pipe",
      }
    );
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
          const match = line.match(
            /https:\/\/[a-z0-9-]+\.trycloudflare\.com/
          );
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

// --- Asana Auto-discovery ---

let userGid: string | null = null;
let workspaceGid: string | null = null;
let taskListGid: string | null = null;

async function discoverUserAndTaskList() {
  const meRes = await asanaFetch(
    "/users/me?opt_fields=gid,name,workspaces,workspaces.name"
  );
  if (!meRes.ok) throw new Error(`Failed to fetch user: ${meRes.status}`);
  const me = (await meRes.json()).data;
  userGid = me.gid;
  workspaceGid = me.workspaces[0].gid;
  log(
    `User: ${me.name} (${userGid}) in workspace ${me.workspaces[0].name}`
  );

  const tlRes = await asanaFetch(
    `/users/${userGid}/user_task_list?workspace=${workspaceGid}&opt_fields=gid`
  );
  if (!tlRes.ok)
    throw new Error(`Failed to fetch task list: ${tlRes.status}`);
  taskListGid = (await tlRes.json()).data.gid;
  log(`Task list: ${taskListGid}`);
}

// --- Asana Webhook Lifecycle ---

async function cleanupStaleAsanaWebhooks() {
  const res = await asanaFetch(`/webhooks?workspace=${workspaceGid}`);
  if (!res.ok) {
    log(`Failed to list Asana webhooks: ${res.status}`);
    return;
  }
  const json = await res.json();
  for (const wh of json.data || []) {
    if (wh.target?.includes("trycloudflare.com")) {
      log(`Deleting stale Asana webhook ${wh.gid} -> ${wh.target}`);
      await asanaFetch(`/webhooks/${wh.gid}`, { method: "DELETE" });
    }
  }
}

async function registerAsanaWebhook(publicUrl: string): Promise<string> {
  const target = `${publicUrl}/asana-webhook`;
  const maxAttempts = 10;
  const delayMs = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    log(
      `Registering Asana webhook (attempt ${attempt}/${maxAttempts}) -> ${target}`
    );
    const res = await asanaFetch("/webhooks", {
      method: "POST",
      body: JSON.stringify({
        data: {
          resource: taskListGid,
          target,
          filters: [
            {
              resource_type: "task",
              action: "changed",
              fields: [
                "assignee",
                "memberships",
                "completed",
                "tags",
                "notes",
                "due_on",
                "name",
              ],
            },
            { resource_type: "task", action: "added" },
            { resource_type: "task", action: "deleted" },
            { resource_type: "task", action: "removed" },
            { resource_type: "task", action: "undeleted" },
            { resource_type: "story", action: "added" },
            { resource_type: "story", action: "changed" },
            { resource_type: "story", action: "removed" },
          ],
        },
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data.gid;
    }
    const text = await res.text();
    if (
      attempt < maxAttempts &&
      (text.includes("ENOTFOUND") || text.includes("unable to connect"))
    ) {
      log(`Tunnel not yet routable, waiting ${delayMs / 1000}s...`);
      await Bun.sleep(delayMs);
      continue;
    }
    throw new Error(`Asana webhook registration failed (${res.status}): ${text}`);
  }
  throw new Error("Asana webhook registration failed after all attempts");
}

async function deleteAsanaWebhook() {
  if (!webhookGid) return;
  log(`Deleting Asana webhook ${webhookGid}`);
  try {
    await asanaFetch(`/webhooks/${webhookGid}`, { method: "DELETE" });
  } catch (e) {
    log(`Failed to delete Asana webhook: ${e}`);
  }
}

// --- GitHub Webhook Lifecycle ---

async function cleanupStaleGitHubWebhooks(repo: string) {
  try {
    const hooks = await ghApi(`/repos/${repo}/hooks`);
    for (const hook of hooks || []) {
      if (hook.config?.url?.includes("trycloudflare.com")) {
        log(`Deleting stale GitHub webhook ${hook.id} on ${repo}`);
        await ghApi(`/repos/${repo}/hooks/${hook.id}`, { method: "DELETE" });
      }
    }
  } catch (e) {
    log(`Failed to cleanup GitHub webhooks for ${repo}: ${e}`);
  }
}

async function registerGitHubWebhook(
  publicUrl: string,
  repo: string
): Promise<number> {
  const target = `${publicUrl}/github-webhook`;
  const maxAttempts = 10;
  const delayMs = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    log(
      `Registering GitHub webhook on ${repo} (attempt ${attempt}/${maxAttempts}) -> ${target}`
    );
    try {
      const result = await ghApi(`/repos/${repo}/hooks`, {
        method: "POST",
        body: {
          name: "web",
          active: true,
          events: GITHUB_EVENTS,
          config: {
            url: target,
            content_type: "json",
            secret: githubWebhookSecret,
            insecure_ssl: "0",
          },
        },
      });
      return result.id;
    } catch (e: any) {
      const msg = String(e);
      if (
        attempt < maxAttempts &&
        (msg.includes("ENOTFOUND") || msg.includes("could not"))
      ) {
        log(
          `Tunnel not yet routable for GitHub, waiting ${delayMs / 1000}s...`
        );
        await Bun.sleep(delayMs);
        continue;
      }
      throw e;
    }
  }
  throw new Error(
    `GitHub webhook registration failed for ${repo} after all attempts`
  );
}

async function deleteGitHubWebhook(repo: string, hookId: number) {
  try {
    await ghApi(`/repos/${repo}/hooks/${hookId}`, { method: "DELETE" });
    log(`Deleted GitHub webhook ${hookId} on ${repo}`);
  } catch (e) {
    log(`Failed to delete GitHub webhook ${hookId} on ${repo}: ${e}`);
  }
}

// --- Cleanup ---

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  log("Shutting down...");

  await deleteAsanaWebhook();
  for (const [repo, hookId] of githubHookIds) {
    await deleteGitHubWebhook(repo, hookId);
  }

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

  await discoverUserAndTaskList();

  tunnelUrl = await startTunnel();
  log(`Tunnel ready: ${tunnelUrl}`);

  // Asana
  await cleanupStaleAsanaWebhooks();
  webhookGid = await registerAsanaWebhook(tunnelUrl);
  log(`Asana webhook registered: ${webhookGid}`);

  // GitHub
  for (const repo of GITHUB_WATCH_REPOS) {
    await cleanupStaleGitHubWebhooks(repo);
    const hookId = await registerGitHubWebhook(tunnelUrl, repo);
    githubHookIds.set(repo, hookId);
    log(`GitHub webhook registered: ${repo} -> ${hookId}`);
  }

  log(`Watching My Tasks via ${tunnelUrl}`);
  if (GITHUB_WATCH_REPOS.length > 0) {
    log(`Watching GitHub repos: ${GITHUB_WATCH_REPOS.join(", ")}`);
  }
}

main().catch((err) => {
  log(`FATAL: ${err}`);
  process.exit(1);
});
