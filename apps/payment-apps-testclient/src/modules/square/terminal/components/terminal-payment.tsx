"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { scheduleTerminalPolling } from "@/modules/square/terminal/terminal-polling";
import {
  checkoutPath,
  clearRejectedTerminalAttempt,
  parseTerminalState,
  post,
  readTestSession,
  saveTestSession,
  shouldPollTerminal,
  type TerminalState,
  type TestSession,
} from "@/modules/square/terminal/test-session";

const initialDevice = env.NEXT_PUBLIC_INITIAL_DEVICE_ID ?? "";
const initialLocation = env.NEXT_PUBLIC_INITIAL_LOCATION_ID ?? "";

export function TerminalPayment({
  saleorApiUrl,
  checkoutId,
}: {
  saleorApiUrl: string;
  checkoutId: string;
}) {
  const router = useRouter();
  const [session, setSession] = useState<TestSession | null>(null);
  const [actorId, setActorId] = useState("staff-001");
  const [associateId, setAssociateId] = useState("associate-001");
  const [squareTeamMemberId, setSquareTeamMemberId] = useState("");
  const [locationId, setLocation] = useState(initialLocation);
  const [deviceId, setDevice] = useState(initialDevice);
  const [reference, setReference] = useState("");
  const [terminal, setTerminal] = useState<TerminalState | null>(null);
  const [attemptId, setAttemptId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const inFlight = useRef(false);

  useEffect(() => {
    const saved = readTestSession(saleorApiUrl, checkoutId) ?? { saleorApiUrl, checkoutId };

    setSession(saved);
    setActorId(saved?.actorId ?? "staff-001");
    setAssociateId(saved?.associateId ?? "associate-001");
    setSquareTeamMemberId(saved?.squareTeamMemberId ?? "");
    setLocation(saved?.locationId ?? initialLocation);
    setDevice(saved?.deviceId ?? initialDevice);
    setReference(saved?.reference ?? "");
    setAttemptId(saved?.attemptId ?? "");
    setTerminal(saved?.terminal ?? null);
    if (saved?.terminal) {
      setNotice("Recovered the last terminal attempt from this browser.");
    } else if (saved?.attemptId) {
      setNotice(
        "A Terminal attempt was already started. Recover that attempt before doing anything else.",
      );
    }
  }, [saleorApiUrl, checkoutId]);

  const callTerminal = useCallback(
    async (action: "start" | "status" | "cancel") => {
      if (!session || inFlight.current) return false;
      inFlight.current = true;
      setBusy(action);
      let pendingSession = session;

      try {
        const stableAttemptId = attemptId || crypto.randomUUID();

        pendingSession = {
          ...session,
          actorId,
          associateId,
          squareTeamMemberId,
          locationId,
          deviceId,
          reference,
          attemptId: stableAttemptId,
        };

        /*
         * Persist the idempotency key before the request. If the page reloads while
         * initiation is in flight, the next start call recovers the same attempt.
         */
        if (action === "start") {
          setAttemptId(stableAttemptId);
          setSession(pendingSession);
          saveTestSession(pendingSession);
        }

        const result = parseTerminalState(
          await post<unknown>("/api/terminal", {
            action,
            actorId,
            saleorApiUrl,
            checkoutId,
            locationId,
            deviceId,
            attemptId: stableAttemptId,
            associateId: associateId || undefined,
            squareTeamMemberId: squareTeamMemberId || undefined,
            reference: reference || undefined,
            terminalCheckoutId: terminal?.terminalCheckoutId,
          }),
        );
        const nextSession = { ...pendingSession, terminal: result };

        setAttemptId(stableAttemptId);
        setTerminal(result);
        setSession(nextSession);
        saveTestSession(nextSession);
        setNotice(
          result.message ??
            `Terminal attempt is ${result.status.toLowerCase().replaceAll("_", " ")}.`,
        );
        if (result.status === "COMPLETED")
          router.push(checkoutPath(saleorApiUrl, checkoutId, "summary"));

        return true;
      } catch (error) {
        const correctedSession =
          action === "start" ? clearRejectedTerminalAttempt(pendingSession, error) : null;

        if (correctedSession) {
          setAttemptId("");
          setTerminal(null);
          setSession(correctedSession);
          saveTestSession(correctedSession);
        }
        setNotice(error instanceof Error ? error.message : "Terminal request failed.");

        return false;
      } finally {
        inFlight.current = false;
        setBusy(null);
      }
    },
    [
      actorId,
      associateId,
      attemptId,
      checkoutId,
      locationId,
      deviceId,
      reference,
      router,
      saleorApiUrl,
      session,
      squareTeamMemberId,
      terminal?.terminalCheckoutId,
    ],
  );

  useEffect(() => {
    if (!terminal || !shouldPollTerminal(terminal)) return;

    return scheduleTerminalPolling(() => callTerminal("status"));
  }, [callTerminal, terminal]);

  function closeAttempt() {
    if (!session || terminal?.status !== "CANCELED") return;
    const nextSession = { ...session, attemptId: undefined, terminal: undefined };

    setAttemptId("");
    setTerminal(null);
    setSession(nextSession);
    saveTestSession(nextSession);
    setNotice("Canceled attempt closed. You can start a new payment for this checkout.");
  }

  if (!session) return <p>Loading Terminal session…</p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <section className="grid gap-6">
        <div>
          <h2 className="text-2xl font-bold">Square Terminal Payment</h2>
          <p className="text-sm text-muted-foreground">Checkout {checkoutId}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 [&_label]:grid [&_label]:gap-2">
          <label>
            Signed-in staff actor
            <Input required value={actorId} onChange={(event) => setActorId(event.target.value)} />
          </label>
          <label>
            Square location ID
            <Input
              required
              disabled={Boolean(attemptId && session.locationId)}
              value={locationId}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <label>
            Square device ID
            <Input
              required
              disabled={Boolean(attemptId && session.deviceId)}
              value={deviceId}
              onChange={(event) => setDevice(event.target.value)}
            />
          </label>
        </div>
        <details className="rounded-md border p-4">
          <summary>Optional details</summary>
          <div className="grid gap-4 md:grid-cols-2 [&_label]:grid [&_label]:gap-2">
            <label>
              Sales associate
              <Input value={associateId} onChange={(event) => setAssociateId(event.target.value)} />
            </label>
            <label>
              Square team member
              <Input
                value={squareTeamMemberId}
                onChange={(event) => setSquareTeamMemberId(event.target.value)}
              />
            </label>
            <label className="md:col-span-2">
              Sale reference
              <Input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Counter ticket 1042"
              />
            </label>
          </div>
        </details>
        {notice ? (
          <p className="rounded-md border bg-muted p-4 text-sm" role="status">
            {notice}
          </p>
        ) : null}
        {terminal ? (
          <div className="grid gap-3 rounded-md border p-4 [&_div]:grid [&_div]:gap-1">
            <div>
              <small>Status</small>
              <strong>{terminal.status.replaceAll("_", " ")}</strong>
            </div>
            <div>
              <small>Terminal checkout</small>
              <code>{terminal.terminalCheckoutId}</code>
            </div>
            {terminal.operatorActionRequired ? (
              <strong className="text-destructive">
                Stop. An operator must reconcile this attempt before retrying.
              </strong>
            ) : null}
          </div>
        ) : null}
        <div className="flex gap-3">
          {!terminal ? (
            <Button
              className=""
              disabled={!actorId.trim() || !deviceId.trim() || !locationId.trim() || busy !== null}
              onClick={() => void callTerminal("start")}
            >
              {busy === "start"
                ? "Sending…"
                : attemptId
                ? "Recover terminal attempt"
                : "Take payment on Terminal"}
            </Button>
          ) : (
            <>
              {!["COMPLETED", "CANCELED"].includes(terminal.status) ? (
                <Button
                  className="bg-destructive text-destructive-foreground"
                  disabled={busy !== null}
                  onClick={() => void callTerminal("cancel")}
                >
                  {busy === "cancel" ? "Cancelling…" : "Cancel payment"}
                </Button>
              ) : null}
              {terminal.status === "CANCELED" ? (
                <Button
                  className="bg-secondary text-secondary-foreground"
                  disabled={busy !== null}
                  onClick={closeAttempt}
                >
                  Close attempt
                </Button>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
