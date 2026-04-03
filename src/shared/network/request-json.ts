export class RequestTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`요청 시간이 ${timeoutMs}ms를 초과했습니다.`);
    this.name = "RequestTimeoutError";
  }
}

export class RequestFailureError extends Error {
  status: number;
  code?: string;
  details?: string[];

  constructor(input: {
    message: string;
    status: number;
    code?: string;
    details?: string[];
  }) {
    super(input.message);
    this.name = "RequestFailureError";
    this.status = input.status;
    this.code = input.code;
    this.details = input.details;
  }
}

type ApiSuccess<TData, TMeta = unknown> = {
  ok: true;
  data: TData;
  meta?: TMeta;
};

type ApiFailure = {
  ok: false;
  error?: string;
  details?: string[];
};

type RequestJsonOptions = RequestInit & {
  timeoutMs?: number;
};

export async function requestJson<TData, TMeta = unknown>(
  input: string,
  options: RequestJsonOptions = {},
): Promise<{ data: TData; meta?: TMeta }> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...options,
      signal: controller.signal,
    });

    const payload = (await response.json()) as
      | ApiSuccess<TData, TMeta>
      | ApiFailure;

    if (!response.ok || !payload.ok) {
      throw new RequestFailureError({
        message: buildFailureMessage(payload),
        status: response.status,
        code:
          payload && typeof payload === "object" && "error" in payload
            ? payload.error
            : undefined,
        details:
          payload && typeof payload === "object" && "details" in payload
            ? payload.details
            : undefined,
      });
    }

    return {
      data: payload.data,
      meta: payload.meta,
    };
  } catch (error) {
    if (isAbortError(error)) {
      throw new RequestTimeoutError(timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function buildFailureMessage(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "details" in payload &&
    Array.isArray(payload.details) &&
    payload.details.length > 0
  ) {
    return payload.details.join(" / ");
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.length > 0
  ) {
    return payload.error;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}
