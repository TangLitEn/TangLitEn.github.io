"use client";

import { FormEvent, useState } from "react";

type MailingAction = "subscribe" | "unsubscribe";

const MAILING_LIST_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyaib4hBGHPnOJLHUNaRqYI5zW_k_tB3o-ab7OJZF9e8yzHioXA4CGXKpVU13eFNr0UTA/exec";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitState = {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};

const extractMessage = async (response: Response): Promise<string> => {
  const text = await response.text();
  if (!text) {
    return "";
  }

  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    return parsed.message ?? parsed.error ?? text;
  } catch {
    return text;
  }
};

export default function MailingList({ compact = false, embedded = false }: { compact?: boolean; embedded?: boolean }) {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle", message: "" });
  const statusMessage = submitState.message;

  const isBusy = submitState.kind === "loading";

  const submitWithAction = async (action: MailingAction) => {
    const value = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(value)) {
      setSubmitState({ kind: "error", message: "Enter a valid email address." });
      return;
    }

    setSubmitState({ kind: "loading", message: "" });

    const url = `${MAILING_LIST_ENDPOINT}?action=${encodeURIComponent(action)}`;
    const payload = {
      action,
      email: value,
      source: "website"
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const message = await extractMessage(response);
      if (!response.ok) {
        throw new Error(message || `Request failed (${response.status})`);
      }

      setSubmitState({
        kind: "success",
        message:
          message ||
          (action === "subscribe"
            ? "You are subscribed to the mailing list."
            : "You have been removed from the mailing list.")
      });
      setEmail("");
    } catch (error) {
      const isCorsFailure = error instanceof TypeError;
      if (isCorsFailure) {
        try {
          await fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
          });
          setSubmitState({
            kind: "success",
            message: "Request sent."
          });
          setEmail("");
          return;
        } catch {
          // Continue into shared error handling below.
        }
      }

      setSubmitState({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to update mailing list right now."
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitWithAction("subscribe");
  };

  return (
    <section
      className={`ml-card lp-animate ${compact ? "is-compact" : ""} ${embedded ? "is-embedded" : ""}`}
      aria-labelledby="mailing-list-title"
    >
      <h2 id="mailing-list-title" className="ml-title">
        Mailing list
      </h2>
      <p className="ml-subtitle">Get updates when I ship new posts and projects.</p>
      <form className="ml-form" onSubmit={handleSubmit}>
        <input
          id="mailing-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="ml-input"
          required
          disabled={isBusy}
        />
        <div className="ml-actions" role="group" aria-label="Mailing list action">
          <button
            type="button"
            className="ml-action-chip"
            onClick={() => submitWithAction("subscribe")}
            disabled={isBusy}
          >
            Subscribe
          </button>
          <button
            type="button"
            className="ml-action-chip"
            onClick={() => submitWithAction("unsubscribe")}
            disabled={isBusy}
          >
            Unsubscribe
          </button>
          <p
            className={`ml-status ${submitState.kind === "error" ? "is-error" : ""} ${
              submitState.kind === "success" ? "is-success" : ""
            }`}
            aria-live="polite"
          >
            {statusMessage}
          </p>
        </div>
      </form>
    </section>
  );
}
