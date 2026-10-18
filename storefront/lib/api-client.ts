/**
 * COCO-VANTAGE Centralized Storefront API Client
 *
 * Provides a unified, robust HTTP client for communicating with the NestJS backend.
 * Works seamlessly across Next.js Server Components, Client Components, and Route Handlers.
 */

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
  cartToken?: string | null;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Resolves the correct backend base URL depending on the execution context.
 *
 * Two separate URLs are required because code runs in two different network
 * environments:
 *
 *   SERVER (Next.js Node process inside Docker):
 *     Cannot use localhost — must use the Docker bridge hostname.
 *     → reads INTERNAL_API_URL (e.g. "http://backend:4000")
 *
 *   BROWSER (client-side React code on the user's machine):
 *     Cannot see Docker-internal hostnames — must use the host-forwarded port.
 *     → reads NEXT_PUBLIC_API_URL (e.g. "http://localhost:4000")
 *
 * Both variables are defined once in the root .env file and injected by
 * docker-compose. No URL is ever hardcoded here.
 */
export function getApiBaseUrl(): string {
  // Server-side: running inside the Docker bridge network (or server runtime)
  if (typeof window === 'undefined') {
    const internalUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!internalUrl) {
      throw new Error(
        '[api-client] Neither INTERNAL_API_URL nor NEXT_PUBLIC_API_URL is set. ' +
          'Configure them in the root .env file.',
      );
    }
    return internalUrl;
  }

  // Client-side: running in the user's browser.
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!publicUrl) {
    throw new Error(
      '[api-client] NEXT_PUBLIC_API_URL is not set. ' +
        'Configure NEXT_PUBLIC_API_URL in your root .env file (e.g. NEXT_PUBLIC_API_URL=http://localhost:4000).',
    );
  }

  // Security guard: Never expose Docker-internal hostnames to browser JavaScript
  if (publicUrl.includes('://backend') || publicUrl.includes('://database')) {
    throw new Error(
      '[api-client] Security error: NEXT_PUBLIC_API_URL must be a browser-reachable URL, not an internal Docker hostname.',
    );
  }

  return publicUrl;
}

export const API_PREFIX = '/api/v1';

/**
 * Resolves an endpoint path to a complete URL, avoiding prefix duplication.
 * - Absolute URLs (http:// or https://) are returned unmodified.
 * - Paths to /health or /health?... bypass the /api/v1 prefix.
 * - Paths that already begin with /api/v1 are preserved without duplication.
 * - All other relative paths are automatically prepended with /api/v1.
 */
export function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (cleanPath === '/health' || cleanPath.startsWith('/health?')) {
    return `${baseUrl}${cleanPath}`;
  }

  if (cleanPath.startsWith('/api/v1/') || cleanPath === '/api/v1') {
    return `${baseUrl}${cleanPath}`;
  }

  return `${baseUrl}${API_PREFIX}${cleanPath}`;
}

/**
 * Core HTTP request handler.
 */
async function request<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const url = resolveApiUrl(path);

  // Construct URL with query parameters if provided
  let targetUrl = url;
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(options.params)) {
      if (val !== undefined && val !== null) {
        searchParams.set(key, String(val));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  // Handle request body and Content-Type
  let bodyContent: BodyInit | undefined = undefined;
  if (options.body !== undefined && options.body !== null) {
    if (
      options.body instanceof FormData ||
      options.body instanceof Blob ||
      options.body instanceof ArrayBuffer ||
      options.body instanceof URLSearchParams
    ) {
      bodyContent = options.body;
    } else if (typeof options.body === 'string') {
      bodyContent = options.body;
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    } else {
      bodyContent = JSON.stringify(options.body);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  // Set Authorization header if token provided
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  // Set X-Cart-Token header if cartToken provided
  if (options.cartToken) {
    headers.set('X-Cart-Token', options.cartToken);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    body: bodyContent,
    credentials: options.credentials ?? 'include',
  };

  try {
    const response = await fetch(targetUrl, fetchOptions);

    // 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      if (data && typeof data === 'object') {
        const payload = data as { message?: string | string[]; error?: string };
        if (Array.isArray(payload.message)) {
          errorMessage = payload.message.join(', ');
        } else if (payload.message) {
          errorMessage = payload.message;
        } else if (payload.error) {
          errorMessage = payload.error;
        }
      } else if (typeof data === 'string' && data.trim()) {
        errorMessage = data;
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : 'Network request failed';
    const baseUrl = getApiBaseUrl();
    throw new ApiError(
      `Cannot connect to backend service (${message}). Ensure backend is active at ${baseUrl}.`,
      0,
    );
  }
}

/**
 * Exported API Client Object
 */
export const apiClient = {
  get<T>(path: string, options?: Omit<ApiClientOptions, 'body'>): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, options?: Omit<ApiClientOptions, 'body'>): Promise<T> {
    return request<T>(path, { ...options, method: 'POST', body });
  },

  patch<T>(path: string, body?: unknown, options?: Omit<ApiClientOptions, 'body'>): Promise<T> {
    return request<T>(path, { ...options, method: 'PATCH', body });
  },

  put<T>(path: string, body?: unknown, options?: Omit<ApiClientOptions, 'body'>): Promise<T> {
    return request<T>(path, { ...options, method: 'PUT', body });
  },

  delete<T>(path: string, options?: Omit<ApiClientOptions, 'body'>): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' });
  },

  request<T>(path: string, options?: ApiClientOptions): Promise<T> {
    return request<T>(path, options);
  },

  // Health endpoint helper
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptimeSeconds: number;
    environment: string;
    database: { status: string; type: string };
  }> {
    return request('/health', { method: 'GET' });
  },
};
