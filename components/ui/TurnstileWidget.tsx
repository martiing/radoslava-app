"use client";

import Script from "next/script";
import { useCallback, useEffect, useId, useRef, useState } from "react";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  size: "flexible" | "normal" | "compact";
  theme: "light" | "dark" | "auto";
  language: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  /** Called with the token once Cloudflare issues one, and with "" when it expires. */
  onToken: (token: string) => void;
}

/**
 * Cloudflare Turnstile challenge. Renders a managed widget that stays invisible
 * for ordinary visitors and only shows an interaction when Cloudflare is
 * suspicious of the client.
 *
 * When NEXT_PUBLIC_TURNSTILE_SITE_KEY is absent (local development without a
 * Cloudflare account) nothing renders and no token is produced — the server
 * action skips verification in development for exactly this case.
 *
 * Turnstile tokens are single-use, so after a rejected submission the caller
 * must remount this component (change its `key`) to get a fresh challenge.
 */
export function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [scriptReady, setScriptReady] = useState(false);
  const containerId = useId();

  // Keep the latest callback without re-rendering the widget on every parent update.
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const handleScriptReady = useCallback(() => setScriptReady(true), []);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || widgetIdRef.current) {
      return;
    }

    const turnstile = window.turnstile;
    if (!turnstile) return;

    widgetIdRef.current = turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(""),
      "error-callback": () => onTokenRef.current(""),
      size: "flexible",
      theme: "auto",
      language: "bg",
    });

    return () => {
      const id = widgetIdRef.current;
      widgetIdRef.current = null;
      if (id) window.turnstile?.remove(id);
    };
  }, [siteKey, scriptReady]);

  if (!siteKey) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onReady={handleScriptReady}
      />
      <div ref={containerRef} id={containerId} />
    </>
  );
}
