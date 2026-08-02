const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

interface ErrorBody {
  message?: string | string[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = data as ErrorBody | null;
    const rawMessage = errorBody?.message ?? "Algo deu errado. Tente novamente.";
    const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { headers, body, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(res);
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" | "PUT" = "POST",
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    body: formData,
  });

  return handleResponse<T>(res);
}
