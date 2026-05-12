import { API_BASE_URL } from "@/lib/config";

export class ApiError extends Error {
  readonly status: number;
  readonly requestId: string;
  readonly body?: unknown;

  constructor(opts: { message: string; status: number; requestId: string; body?: unknown }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.requestId = opts.requestId;
    this.body = opts.body;
  }
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  baseUrl?: string;
  headers?: HeadersInit;
  query?: Record<string, string | number | boolean | null | undefined>;
  json?: Json;
};

function buildUrl(path: string, baseUrl: string | undefined, query?: ApiRequestOptions["query"]) {
  const url = new URL(path, baseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function safeParseJson(res: Response) {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function api<TResponse = unknown>(
  path: string,
  opts: ApiRequestOptions = {}
): Promise<TResponse> {
  const requestId = crypto.randomUUID();
  const baseUrl = opts.baseUrl ?? API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL."
    );
  }

  const url = buildUrl(path, baseUrl, opts.query);

  const headers = new Headers(opts.headers);
  headers.set("X-Request-Id", requestId);

  const hasJsonBody = opts.json !== undefined;
  if (hasJsonBody) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const res = await fetch(url, {
    ...opts,
    headers,
    body: hasJsonBody ? JSON.stringify(opts.json) : undefined
  });

  if (!res.ok) {
    const body = await safeParseJson(res);
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as any).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError({ message, status: res.status, requestId, body });
  }

  if (res.status === 204) return undefined as TResponse;

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as TResponse;
  }

  return (await res.text()) as unknown as TResponse;
}

