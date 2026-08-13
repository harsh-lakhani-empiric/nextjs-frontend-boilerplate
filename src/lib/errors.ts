export type ErrorCode = "VALIDATION_ERROR" | "API_ERROR" | "INTERNAL_ERROR";

export type AppErrorInfo = {
  code: ErrorCode;
  statusCode: number;
  fieldErrors?: Record<string, string[]>;
};

export type AppError = Error & AppErrorInfo;

function makeError(message: string, info: AppErrorInfo, cause?: unknown): AppError {
  const error = new Error(message, { cause }) as AppError;
  Object.assign(error, info);
  return error;
}

export function appError(
  message: string,
  options?: { statusCode?: number; code?: ErrorCode; cause?: unknown },
): AppError {
  return makeError(
    message,
    { code: options?.code ?? "INTERNAL_ERROR", statusCode: options?.statusCode ?? 500 },
    options?.cause,
  );
}

export function validationError(message: string, fieldErrors?: Record<string, string[]>): AppError {
  return makeError(message, { code: "VALIDATION_ERROR", statusCode: 400, fieldErrors });
}

export function apiError(message: string, statusCode = 502, cause?: unknown): AppError {
  return makeError(message, { code: "API_ERROR", statusCode }, cause);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && "code" in error && "statusCode" in error;
}

export type ErrorResponse = {
  error: {
    message: string;
    code: string;
    fieldErrors?: Record<string, string[]>;
  };
};

/** Converts any thrown value into a consistent shape for Route Handlers/Server Actions. */
export function toErrorResponse(error: unknown): { status: number; body: ErrorResponse } {
  if (isAppError(error)) {
    return {
      status: error.statusCode,
      body: { error: { message: error.message, code: error.code, fieldErrors: error.fieldErrors } },
    };
  }

  return {
    status: 500,
    body: { error: { message: "Something went wrong.", code: "INTERNAL_ERROR" } },
  };
}
