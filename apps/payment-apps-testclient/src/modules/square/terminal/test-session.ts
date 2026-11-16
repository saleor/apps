export type TerminalState = {
  terminalCheckoutId: string;
  saleorTransactionId?: string;
  checkoutId: string;
  status:
    | "PENDING"
    | "IN_PROGRESS"
    | "CANCEL_REQUESTED"
    | "COMPLETED"
    | "CANCELED"
    | "RECONCILIATION_NEEDED";
  message?: string;
  pollUseful?: boolean;
  operatorActionRequired?: boolean;
};

const terminalStatuses = new Set<TerminalState["status"]>([
  "PENDING",
  "IN_PROGRESS",
  "CANCEL_REQUESTED",
  "COMPLETED",
  "CANCELED",
  "RECONCILIATION_NEEDED",
]);

export function parseTerminalState(value: unknown): TerminalState {
  if (!value || typeof value !== "object") {
    throw new Error("Terminal app returned an invalid response. No payment was confirmed.");
  }

  const candidate = value as Partial<TerminalState>;

  if (
    typeof candidate.terminalCheckoutId !== "string" ||
    !candidate.terminalCheckoutId ||
    typeof candidate.checkoutId !== "string" ||
    !candidate.checkoutId ||
    typeof candidate.status !== "string" ||
    !terminalStatuses.has(candidate.status as TerminalState["status"]) ||
    [candidate.message, candidate.saleorTransactionId].some(
      (field) => field !== undefined && typeof field !== "string",
    ) ||
    [candidate.pollUseful, candidate.operatorActionRequired].some(
      (field) => field !== undefined && typeof field !== "boolean",
    )
  ) {
    throw new Error("Terminal app returned an invalid response. No payment was confirmed.");
  }

  return candidate as TerminalState;
}

const pollableTerminalStates = new Set<TerminalState["status"]>([
  "PENDING",
  "IN_PROGRESS",
  "CANCEL_REQUESTED",
  "RECONCILIATION_NEEDED",
]);

export function shouldPollTerminal(state: TerminalState) {
  /*
   * Initiation responses from older app versions did not include pollUseful.
   * Status remains authoritative so those attempts still reach reconciliation.
   */
  return state.pollUseful !== false && pollableTerminalStates.has(state.status);
}
export type TestSession = {
  saleorApiUrl: string;
  channel?: string;
  checkoutId: string;
  actorId?: string;
  associateId?: string;
  squareTeamMemberId?: string;
  locationId?: string;
  deviceId?: string;
  reference?: string;
  attemptId?: string;
  terminal?: TerminalState;
};

export const terminalSessionKey = (saleorApiUrl: string, checkoutId: string) =>
  `payment-testclient:terminal:${encodeURIComponent(saleorApiUrl)}:${encodeURIComponent(
    checkoutId,
  )}`;

export function readTestSession(saleorApiUrl: string, checkoutId: string): TestSession | null {
  const key = terminalSessionKey(saleorApiUrl, checkoutId);
  const saved = window.localStorage.getItem(key);

  if (!saved) return null;
  try {
    const value = JSON.parse(saved) as TestSession;

    if (value.saleorApiUrl !== saleorApiUrl || value.checkoutId !== checkoutId) return null;

    if (value.terminal) {
      try {
        value.terminal = parseTerminalState(value.terminal);
      } catch {
        /*
         * Older clients persisted an upstream response before validating it.
         * Keep the stable attempt id so the backend can recover with the same idempotency key,
         * but remove the malformed object that would crash the payment page.
         */
        delete value.terminal;
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    }

    return value;
  } catch {
    window.localStorage.removeItem(key);

    return null;
  }
}

export function saveTestSession(value: TestSession) {
  window.localStorage.setItem(
    terminalSessionKey(value.saleorApiUrl, value.checkoutId),
    JSON.stringify(value),
  );
}

export class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

const rejectedPaymentTargets = new Set([
  "SQUARE_DEVICE_NOT_FOUND",
  "SQUARE_DEVICE_NOT_PAIRED",
  "SQUARE_DEVICE_WRONG_LOCATION",
  "SQUARE_LOCATION_NOT_FOUND",
  "SQUARE_LOCATION_MISMATCH",
  "SQUARE_LOCATION_INACTIVE",
  "SQUARE_LOCATION_CURRENCY_MISMATCH",
]);

export function clearRejectedTerminalAttempt(
  session: TestSession,
  error: unknown,
): TestSession | null {
  /*
   * These codes are emitted by target validation before a payment attempt is
   * created. All other failures retain the original target and recovery key.
   */
  if (
    session.terminal ||
    !(error instanceof RequestError) ||
    !error.code ||
    !rejectedPaymentTargets.has(error.code)
  ) {
    return null;
  }

  return { ...session, attemptId: undefined, terminal: undefined };
}

export async function post<T>(
  path: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const result = (await response.json()) as T & {
    error?: string;
    message?: string;
    code?: unknown;
  };

  if (!response.ok)
    throw new RequestError(
      result.error ?? result.message ?? `Request failed (${response.status}).`,
      response.status,
      typeof result.code === "string" ? result.code : undefined,
    );

  return result;
}

export function checkoutPath(saleorApiUrl: string, checkoutId: string, step: string) {
  return `/env/${encodeURIComponent(saleorApiUrl)}/checkout/${encodeURIComponent(
    checkoutId,
  )}/payment-gateway/square/terminal/${step}`;
}
