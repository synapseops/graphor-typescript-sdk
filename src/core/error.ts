// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { castToError } from '../internal/errors';

export class GraphorError extends Error {}

/**
 * Thrown instead of returning a result when the API did not apply a folder
 * filter or scope that the call sent, or does not offer a folder method.
 *
 * The SDK refuses such a result because it would cover more sources than
 * asked for (a list of the whole project, an answer drawn from every source).
 * `parameter` names what was not applied: `folder`, `recursive`, `folders`, or
 * the folder route. It is never retried.
 *
 * For `ask`, the API has already answered: the turn was recorded in its
 * conversation (`conversationId`, when the answer carried one). Repeat the
 * question with `reset: true` or without a `conversation_id`.
 */
export class FolderScopeNotAppliedError extends GraphorError {
  readonly parameter: string;
  readonly conversationId: string | undefined;

  constructor(parameter: string, message: string, { conversationId }: { conversationId?: string } = {}) {
    super(message);
    this.parameter = parameter;
    this.conversationId = conversationId;
  }
}

export class APIError<
  TStatus extends number | undefined = number | undefined,
  THeaders extends Headers | undefined = Headers | undefined,
  TError extends Object | undefined = Object | undefined,
> extends GraphorError {
  /** HTTP status for the response that caused the error */
  readonly status: TStatus;
  /** HTTP headers for the response that caused the error */
  readonly headers: THeaders;
  /** JSON body of the response that caused the error */
  readonly error: TError;

  constructor(status: TStatus, error: TError, message: string | undefined, headers: THeaders) {
    super(`${APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.error = error;
  }

  private static makeMessage(status: number | undefined, error: any, message: string | undefined) {
    const msg =
      error?.message ?
        typeof error.message === 'string' ?
          error.message
        : JSON.stringify(error.message)
      : error ? JSON.stringify(error)
      : message;

    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return '(no status code or body)';
  }

  static generate(
    status: number | undefined,
    errorResponse: Object | undefined,
    message: string | undefined,
    headers: Headers | undefined,
  ): APIError {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }

    const error = errorResponse as Record<string, any>;

    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }

    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }

    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }

    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }

    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }

    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }

    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }

    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }

    return new APIError(status, error, message, headers);
  }
}

/**
 * Thrown when the bytes of a large file could not be uploaded or completed.
 *
 * `offset` is how many bytes the upload had stored when it stopped (`-1` when
 * the bytes were all sent and completing them failed). `buildId` is set when
 * the upload may still finish: check that build before uploading again.
 */
export class UploadError extends APIError<number | undefined, undefined, undefined> {
  readonly offset: number;
  readonly buildId: string | undefined;

  constructor(
    message: string,
    {
      offset,
      status,
      buildId,
    }: { offset: number; status?: number | undefined; buildId?: string | undefined },
  ) {
    super(status, undefined, message, undefined);
    this.offset = offset;
    this.buildId = buildId;
  }
}

export class APIUserAbortError extends APIError<undefined, undefined, undefined> {
  constructor({ message }: { message?: string } = {}) {
    super(undefined, undefined, message || 'Request was aborted.', undefined);
  }
}

export class APIConnectionError extends APIError<undefined, undefined, undefined> {
  constructor({ message, cause }: { message?: string | undefined; cause?: Error | undefined }) {
    super(undefined, undefined, message || 'Connection error.', undefined);
    // in some environments the 'cause' property is already declared
    // @ts-ignore
    if (cause) this.cause = cause;
  }
}

export class APIConnectionTimeoutError extends APIConnectionError {
  constructor({ message }: { message?: string } = {}) {
    super({ message: message ?? 'Request timed out.' });
  }
}

export class BadRequestError extends APIError<400, Headers> {}

export class AuthenticationError extends APIError<401, Headers> {}

export class PermissionDeniedError extends APIError<403, Headers> {}

export class NotFoundError extends APIError<404, Headers> {}

export class ConflictError extends APIError<409, Headers> {}

export class UnprocessableEntityError extends APIError<422, Headers> {}

export class RateLimitError extends APIError<429, Headers> {}

export class InternalServerError extends APIError<number, Headers> {}
